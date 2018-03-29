'use strict';

angular.module('nearPlaceApp')
  .controller('PlaceCtrl',
    function ($scope, $mdDialog, $mdToast, Place, Route, Auth) {

      // Pagination options
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
      }

      loadCount();
      $scope.onQueryChange = function () {
        $scope.query.page = 1;
        $scope.query.total = 0;
        loadPlaces();
        loadCount();
      }

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

      }

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
          clickOutsideToClose: true
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

    }).controller('DialogPlaceController', function ($scope, $mdDialog, $mdToast, Place, Route, File, NgMap, GeoCoder, place) {

      var marker, map;

      $scope.routes = [];
      $scope.place = {};
      $scope.place.images = [];
      $scope.place.deletedImages = [];

      $scope.place.website = 'http://';
      $scope.imageFilename = '';

      $scope.audioFilename_ru = '';
      $scope.audioFilename_ro = '';
      $scope.audioFilename_en = '';
      $scope.input = {};

      $scope.isCreating = true;
      $scope.isImageUploading = false;
      $scope.isAudioUploading_ru = false;
      $scope.isAudioUploading_ro = false;
      $scope.isAudioUploading_en = false;

      if (place) {

        $scope.place = place;

        if ($scope.place.audio_ru) {
          $scope.audioFilename_ru = $scope.place.audio_ru.name();
        }
        if ($scope.place.audio_ro) {
          $scope.audioFilename_ro = $scope.place.audio_ro.name();
        }
        if ($scope.place.audio_en) {
          $scope.audioFilename_en = $scope.place.audio_en.name();
        }

        $scope.input.latitude = place.location.latitude;
        $scope.input.longitude = place.location.longitude;

        $scope.isCreating = false;
      }

      Route.all({ page: 1, limit: 1000, filter: '' })
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

      $scope.onAddressChanged_ru = function () {
        GeoCoder.geocode({ address: $scope.place.address_ru }).then(function (result) {

          if (map) {

            var location = result[0].geometry.location;
            location = new google.maps.LatLng(location.lat(), location.lng());

            map.setCenter(location);
            map.setZoom(15);

            marker.setPosition(location);

            $scope.place.location = new Parse.GeoPoint({
              latitude: location.lat(),
              longitude: location.lng()
            });

            $scope.input.latitude = location.lat();
            $scope.input.longitude = location.lng();
          }
        });
      };

      $scope.onAddressChanged_ro = function () {
        GeoCoder.geocode({ address: $scope.place.address_ro }).then(function (result) {

          if (map) {

            var location = result[0].geometry.location;
            location = new google.maps.LatLng(location.lat(), location.lng());

            map.setCenter(location);
            map.setZoom(15);

            marker.setPosition(location);

            $scope.place.location = new Parse.GeoPoint({
              latitude: location.lat(),
              longitude: location.lng()
            });

            $scope.input.latitude = location.lat();
            $scope.input.longitude = location.lng();
          }
        });
      };

      $scope.onAddressChanged_en = function () {
        GeoCoder.geocode({ address: $scope.place.address_en }).then(function (result) {

          if (map) {

            var location = result[0].geometry.location;
            location = new google.maps.LatLng(location.lat(), location.lng());

            map.setCenter(location);
            map.setZoom(15);

            marker.setPosition(location);

            $scope.place.location = new Parse.GeoPoint({
              latitude: location.lat(),
              longitude: location.lng()
            });

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
          $scope.imageFilename = file.name;

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

      // $scope.uploadImageFile = function (file, invalidFile) {
      //
      //   if (file) {
      //
      // $scope.isImageUploading = true;
      // $scope.imageFilename = file.name;
      //
      // File.upload(file).then(function (savedFile) {
      //
      //     $scope.place.image = (savedFile);
      //     $scope.isImageUploading = false;
      //     showSimpleToast('Image uploaded');
      //   },
      //   function (error) {
      //     $scope.isImageUploading = false;
      //     showSimpleToast(error.message);
      //   });
      //
      //   } else {
      //     if (invalidFile) {
      //       if (invalidFile.$error === 'maxSize') {
      //         showSimpleToast('Image too big. Max ' + invalidFile.$errorParam);
      //       }
      //     }
      //   }
      // };

      $scope.uploadAudio_ru = function (file, invalidFile) {

        if (file) {

          $scope.isAudioUploading_ru = true;
          $scope.audioFilename_ru = file.name;

          File.uploadAudio(file).then(function (savedFile) {

            $scope.place.audio_ru = savedFile;
            $scope.isAudioUploading_ru = false;
            showSimpleToast('Audio RU uploaded');
          },
            function (error) {
              $scope.isAudioUploading_ru = false;
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

      $scope.uploadAudio_ro = function (file, invalidFile) {

        if (file) {

          $scope.isAudioUploading_ro = true;
          $scope.audioFilename_ro = file.name;

          File.uploadAudio(file).then(function (savedFile) {

            $scope.place.audio_ro = savedFile;
            $scope.isAudioUploading_ro = false;
            showSimpleToast('Audio RO uploaded');
          },
            function (error) {
              $scope.isAudioUploading_ro = false;
              showSimpleToast(error.message);
            });
        } else {
          if (invalidFile) {
            if (invalidFile.$error === 'maxSize') {
              showSimpleToast('Audio RO too big. Max ' + invalidFile.$errorParam);
            }
          }
        }
      };
      $scope.uploadAudio_en = function (file, invalidFile) {

        if (file) {

          $scope.isAudioUploading_en = true;
          $scope.audioFilename_en = file.name;

          File.uploadAudio(file).then(function (savedFile) {

            $scope.place.audio_en = savedFile;
            $scope.isAudioUploading_ro = false;
            showSimpleToast('Audio EN uploaded');
          },
            function (error) {
              $scope.isAudioUploading_en = false;
              showSimpleToast(error.message);
            });
        } else {
          if (invalidFile) {
            if (invalidFile.$error === 'maxSize') {
              showSimpleToast('Audio RO too big. Max ' + invalidFile.$errorParam);
            }
          }
        }
      };

      // $scope.uploadImageOne = function (file, invalidFile) {
      //
      //   if (file) {
      //
      // $scope.isImageOneUploading = true;
      // $scope.imageOneFilename = file.name;
      //
      // File.upload(file).then(function (savedFile) {
      //
      //     $scope.place.image = savedFile;
      //     $scope.isImageOneUploading = false;
      //     showSimpleToast('Image uploaded');
      //   },
      //   function (error) {
      //     $scope.isImageOneUploading = false;
      //     showSimpleToast(error.message);
      //   });

      //   } else {
      //     if (invalidFile) {
      //       if (invalidFile.$error === 'maxSize') {
      //         showSimpleToast('Image too big. Max ' + invalidFile.$errorParam);
      //       }
      //     }
      //   }
      // };

      $scope.hide = function () {
        $mdDialog.cancel();
      };

      $scope.cancel = function () {
        $mdDialog.cancel();
      };

      $scope.onSavePlace = function (isFormValid) {

        if (!isFormValid) {
          showSimpleToast('Please correct all highlighted errors and try again');
        }
        else if (!$scope.place.images) {
          showSimpleToast('Upload at least the first image');
        }
        else if (!$scope.place.location) {
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
            showSimpleToast('Place deleted.');
            $scope.isSavingPlace = false;
          }
        }
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

    })
  .controller('DialogPlaceExpiresAtController',
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
      }

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
      }

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
