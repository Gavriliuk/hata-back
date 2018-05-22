'use strict';
angular.module('nearPlaceApp')
  .controller('PlaceCtrl',
    function ($scope, $mdDialog, $mdToast, Place, Route, Auth) {
      $scope.rowOptions = [10, 20, 40];

      $scope.query = {
        filter: '',
        limit: 40,
        page: 1,
        total: 0,
        status: null,
        route_ru: null,
        route_ro: null,
        route_en: null,
        date: null
      };

      $scope.places = [];
      $scope.sortColumn = "title_ru";
      $scope.reverseSort = false;

      $scope.sortData = function (column) {
        $scope.reverseSort = ($scope.sortColumn == column) ? !$scope.reverseSort : false;
        $scope.sortColumn = column;
      };

      $scope.getSortClass = function (column) {
        if ($scope.sortColumn == column) {
          return $scope.reverseSort ? 'keyboard_arrow_down' : 'keyboard_arrow_up'
        }
        return '';
      };

      var showSimpleToast = function (message) {
        $mdToast.show(
          $mdToast.simple()
            .content(message)
            .action('OK')
            .hideDelay(3000)
        );
      };

      var loadPlaces = function () {
        Auth.ensureLoggedIn().then(function () {
          $scope.promise = Place.all($scope.query).then(function (places) {
            $scope.places = places;
          });
        });
      };

      loadPlaces();

      var loadCount = function () {
        Auth.ensureLoggedIn().then(function () {
          Place.count($scope.query).then(function (total) {
            $scope.query.total = total;
          });
        });
      };

      loadCount();

      $scope.onQueryChange = function () {
        $scope.query.page = 1;
        $scope.query.total = 0;
        loadPlaces();
        loadCount();
      };

      $scope.onCreatePlace = function (ev) {
        $mdDialog.show({
          controller: 'DialogPlaceController',
          templateUrl: '/views/partials/place.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          locals: {
            place: null
          },
          clickOutsideToClose: true
        })
          .then(function (answer) {
            loadPlaces();
            loadCount();
          });
      };

      $scope.onPaginationChange = function (page, limit) {
        $scope.query.page = page;
        $scope.query.limit = limit;
        loadPlaces();
      };

      $scope.openMenu = function ($mdOpenMenu, ev) {
        $mdOpenMenu(ev);
      };

      $scope.isDate = function (date) {
        return angular.isDate(date);
      }

      $scope.onUpdateExpiresAt = function (ev, place) {
        $mdDialog.show({
          controller: 'DialogPlaceExpiresAtController',
          templateUrl: '/views/partials/expiration-modal.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          locals: {
            place: place
          }
        });
      };

      $scope.onUpdatePlace = function (ev, place) {
        var objPlace = angular.copy(place);
        $mdDialog.show({
          controller: 'DialogPlaceController',
          templateUrl: '/views/partials/place.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          locals: {
            place: objPlace
          },
          clickOutsideToClose: true,
        });
      };

      $scope.onDestroyPlace = function (ev, place) {
        var confirm = $mdDialog.confirm()
          .title('Confirm action')
          .content('Are you sure you want to delete this place?')
          .ok('Delete')
          .cancel('Cancel')
          .targetEvent(ev);

        $mdDialog.show(confirm).then(function () {
          Place.destroy(place).then(function (success) {
            showSimpleToast('Place deleted.');
            loadPlaces();
            loadCount();
          },
            function (error) {
              showSimpleToast(error.message);
            });
        });
      };

      $scope.onUpdateIsApproved = function (place, isApproved) {
        place.isApproved = isApproved;
        place.unset('expiresAt');
        Place.update(place).then(function (success) {
          showSimpleToast('Place updated');
        }, function (error) {
          showSimpleToast('There was an error');
        });
      };
    }).controller('DialogPlaceController', function ($scope, $mdDialog, $mdToast, Place, Category, Route, File, NgMap, GeoCoder, place) {
      var marker, map;
      var loadCategories = function () {
        $scope.promise = Category.all({}).then(function (categories) {
          $scope.categories = categories;
        });
      };

      loadCategories();

      $scope.routes = [];
      $scope.isCreating = false;
      $scope.isUploading = false;
      $scope.place = {};
      $scope.place.images = [];
      $scope.place.website = 'http://';
      $scope.imageFilenames = '';
      $scope.input = {};
      $scope.searchAddress = "Chisinau";
      $scope.isImageUploading = false;
      $scope.audioFilename = {};
      $scope.isAudioUploading = {
        ro: false,
        ru: false,
        en: false
      };
      $scope.audioFilename.ru = '';
      $scope.audioFilename.ro = '';
      $scope.audioFilename.en = '';


      if (place) {
        $scope.isCreating = false;
        $scope.place = place;
        $scope.input.latitude = $scope.place.location.latitude,
        $scope.input.longitude = $scope.place.location.longitude
        $scope.imageFilenames = place.images.map(function (image) {
          return image.name();
        });
        if (place.audio_ru) {
          $scope.audioFilename.ru = place.audio_ru.name();
        }
        if (place.audio_ro) {
          $scope.audioFilename.ro = place.audio_ro.name();
        }
        if (place.audio_en) {
          $scope.audioFilename.en = place.audio_en.name();
        }
      } else {
        $scope.isCreating = true;
      }

      Route.all({
        page: 1,
        limit: 1000,
        filter: ''
      })
        .then(function (routes) {
          $scope.routes = routes;
        });

      var showSimpleToast = function (message) {
        $mdToast.show(
          $mdToast.simple()
            .content(message)
            .action('OK')
            .hideDelay(3000)
        );
      };

      $scope.uploadAudio = function (file, invalidFile, lang) {

        if (file) {
          $scope.isAudioUploading[lang] = true;
          $scope.audioFilename[lang] = file.name;

          File.uploadAudio(file).then(function (savedFile) {
            $scope.place['audio_' + lang] = savedFile;
            $scope.isAudioUploading[lang] = false;
            showSimpleToast('Audio uploaded');
          },
            function (error) {
              $scope.isAudioUploading[lang] = false;
              showSimpleToast(error.message);
            });
        } else {
          if (invalidFile) {
            if (invalidFile.$error === 'maxSize') {
              showSimpleToast('Audio too big. Max ' + invalidFile.$errorParam);
            }
          }
        }
      };

      $scope.onSearchAddressChanged = function () {
        GeoCoder.geocode({
          address: $scope.searchAddress
        }).then(function (result) {
          if (map) {
            var location = result[0].geometry.location;
            location = new google.maps.LatLng(location.lat(), location.lng());
            map.setCenter(location);
            map.setZoom(15);
            marker.setPosition(location);
            $scope.input.latitude = location.lat();
            $scope.input.longitude = location.lng();
          }
        });
      };

      NgMap.getMap().then(function (objMap) {
        map = objMap;
        marker = map.markers[0];
        // Fix gray area in second render
        google.maps.event.trigger(map, 'resize');

        if (place) {
          var placeLocation = new google.maps.LatLng(
            place.location.latitude,
            place.location.longitude);
          map.setCenter(placeLocation)
          marker.setPosition(placeLocation);
          map.setZoom(15);
        } else {
          map.setZoom(1);
          map.setCenter(new google.maps.LatLng(0, 0));
        }
      });


      $scope.onMarkerDragEnd = function (ev) {

        var lat = ev.latLng.lat();
        var lng = ev.latLng.lng();

        $scope.place.location = new Parse.GeoPoint({
          latitude: lat,
          longitude: lng
        });

        $scope.input.latitude = lat;
        $scope.input.longitude = lng;
      };

      $scope.onInputLocationChanged = function () {

        if ($scope.input.latitude && $scope.input.longitude && map) {
          $scope.place.location = new Parse.GeoPoint({
            latitude: $scope.input.latitude,
            longitude: $scope.input.longitude
          });

          marker.setPosition(new google.maps.LatLng(
            $scope.input.latitude,
            $scope.input.longitude
          ));

          map.setCenter(new google.maps.LatLng(
            $scope.input.latitude,
            $scope.input.longitude
          ));

          map.setZoom(12);
        }
      };

      $scope.uploadImageFile = function (file, invalidFile) {

        if (file) {
          $scope.isImageUploading = true;
          $scope.imageFilenames = file.name;

          File.upload(file).then(function (savedFile) {
            $scope.place.images.push(savedFile);
            $scope.isImageUploading = false;
            showSimpleToast('Image uploaded');
          },
            function (error) {
              $scope.isImageUploading = false;
              showSimpleToast(error.message);
            });

        } else {
          if (invalidFile) {
            if (invalidFile.$error === 'maxSize') {
              showSimpleToast('Image too big. Max ' + invalidFile.$errorParam);
            }
          }
        }
      };

      $scope.hide = function () {
        $mdDialog.cancel();
      };

      $scope.cancel = function () {
        $mdDialog.cancel();
      };

      $scope.onSavePlace = function (isFormValid) {

        if (!isFormValid) {
          showSimpleToast('Please correct all highlighted errors and try again');
        } else if (!$scope.place.images) {
          showSimpleToast('Upload at least the first image');
        } else if (!$scope.place.location) {
          showSimpleToast('Ubication is required');
        } else {
          Place.create($scope.place).then(function (success) {
            showSimpleToast('Place saved');
            $mdDialog.hide();
            $scope.isSavingPlace = false;
          },
            function (error) {
              showSimpleToast(error.message);
              $scope.isSavingPlace = false;
            });
        }
      };

      $scope.onDeleteImage = function (ev) {
        $scope.isSavingPlace = true;
        for (var i = 0; i < $scope.place.images.length; i++) {
          if ($scope.place.images[i].$$hashKey === ev.$$hashKey) {
            $scope.place.images.splice(i, 1);
            showSimpleToast('Image deleted.');
            $scope.isSavingPlace = false;
            $scope.imageFilenames = $scope.place.images.map(function (image) {
              return image.name();
            });
          }
        }
      };


      $scope.onDeleteAudio = function (lang) {
        $scope.isSavingPlace = true;
        $scope.place['audio_' + lang] = null;
        $scope.audioFilename[lang] = null;

        showSimpleToast('Audio deleted.');
        $scope.isSavingPlace = false;
      };

      $scope.onUpdatePlace = function (isFormValid) {
        if (!isFormValid) {
          showSimpleToast('Please correct all highlighted errors and try again');
        } else {
          $scope.isSavingPlace = true;

          Place.update($scope.place).then(function (place) {
            showSimpleToast('Place updated');
            $mdDialog.hide();
            $scope.isSavingPlace = false;
          },
            function (error) {
              showSimpleToast('Error. Place not updated.', error.message);
              $scope.isSavingPlace = false;
            });
        }
      };
    }).controller('DialogPlaceExpiresAtController',
      function ($scope, $mdDialog, $mdToast, Place, place) {

        $scope.place = place;
        $scope.formData = {};

        var showToast = function (message) {
          $mdToast.show(
            $mdToast.simple()
              .content(message)
              .action('OK')
              .hideDelay(3000)
          );
        };

        $scope.isDayInvalid = function () {
          var days = $scope.formData.days;
          if (days) {
            days = parseInt(days, 10);
            return days < 1;
          }
          return true;
        };

        $scope.onUpdateExpiresAt = function () {
          var expiresAt = moment().add($scope.formData.days, 'days').toDate();
          place.expiresAt = expiresAt;
          place.isApproved = true;

          $scope.isSavingExpiresAt = true;

          Place.update(place).then(function (success) {
            $scope.isSavingExpiresAt = false;
            showToast('Place updated');
            $scope.hide();
          },
            function (error) {
              $scope.isSavingExpiresAt = false;
              showToast('There was an error');
            });
        };

        $scope.hide = function () {
          $mdDialog.hide();
        };

      }).directive('numbersOnly', function () {
        return {
          require: 'ngModel',
          link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
              if (text) {
                var transformedInput = text.replace(/[^0-9]/g, '');

                if (transformedInput !== text) {
                  ngModelCtrl.$setViewValue(transformedInput);
                  ngModelCtrl.$render();
                }
                return transformedInput;
              }
              return undefined;
            }
            ngModelCtrl.$parsers.push(fromUser);
          }
        };
      });