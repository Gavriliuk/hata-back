'use strict';
angular.module('nearPlaceApp')
  .controller('CountryController', function ($scope, $mdToast, $mdDialog, Country, City, Auth) {

        $scope.country = {};
        $scope.objCountry = {};
        $scope.data = {
          selectedIndex: 0
        };
        $scope.relationsCities = [];
        $scope.query = {
            filter: '',
            limit: 40,
            page: 1,
            total: 0
        };
        $scope.sortColumn = "name";
        $scope.reverseSort = false;
        $scope.sortData = function (column) {
            $scope.reverseSort = ($scope.sortColumn == column) ? !$scope.reverseSort : false;
            $scope.sortColumn = column;
        }
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

        $scope.loadCountry = function (id) {
            Auth.ensureLoggedIn().then(function () {
                $scope.promise = Country.get(id).then(function (country) {
                    if (country) {
                      $scope.country = country;
                      citiesRelFunction(country);
                    }
                });
            });
        };
        var loadCountry = function (id) {
            $scope.loadCountry(id);
        };

        var citiesRelFunction = function (country) {
            if (country) {
                var relation = country.relation('citiesRelation');
                var query = relation.query();
                Country.find(query).then(function (cities) {
                    $scope.relationsCities = cities;
                }, function (error) {
                    $scope.relationsCities = [];
                });
            }
        };

        var loadCount = function () {
            Auth.ensureLoggedIn().then(function () {
              Country.count($scope.query).then(function (total) {
                    $scope.query.total = total;
                });
            });
        };
        loadCount();

        $scope.openMenu = function ($mdOpenMenu, ev) {
            $mdOpenMenu(ev);
        };

        $scope.onAdd = function (ev) {
            if ($scope.data.selectedIndex == 0) {
                onAddCityInCountry(ev);
            } 
        };

        $scope.onCreateCityInCountry = function (ev) {
          $mdDialog.show({
            controller: 'DialogCityInCountryController',
            templateUrl: '/views/partials/city.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            locals: {
              city: null,
              country: $scope.country,
            },
            clickOutsideToClose: true
          })
            .then(function (answer) {
              loadCountry($scope.country.id);
              loadCount();
            });
        };

        $scope.onEditCityInCountry = function (ev, city) {
          $mdDialog.show({
            controller: 'DialogCityInCountryController',
            templateUrl: '/views/partials/city.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            locals: {
              city: angular.copy(city),
              country: $scope.country,
            },
            clickOutsideToClose: true
          })
            .then(function (answer) {
              loadCountry($scope.country.id);
              loadCount();
            });
        };

        $scope.sortColumn = "title_ru";
        $scope.reverseSort = false;
        $scope.sortCity = function (column) {
            $scope.reverseSort = ($scope.sortColumn == column) ? !$scope.reverseSort : false;
            $scope.sortColumn = column;
        };

        $scope.getSortClass = function (column) {
          if ($scope.sortColumn == column) {
            return $scope.reverseSort ? 'keyboard_arrow_down' : 'keyboard_arrow_up'
          }
          return '';
        };

        $scope.onDestroyCityInCountry = function (ev, city) {
            var confirm = $mdDialog.confirm()
              .title('Confirm action')
              .content('Are you sure you want to delete this city?')
              .ok('Delete')
              .cancel('Cancel')
              .targetEvent(ev);
          
            $mdDialog.show(confirm).then(function () {
              City.destroy(city).then(function (success) {
                  showSimpleToast('City deleted.');
                  loadCountry($scope.country.id);
                  loadCount();
              },
                function (error) {
                  showSimpleToast('Error. City not deleted.', error.message);
              });
          
            });
        };
  })
.controller('DialogCityInCountryController', function ($scope, $mdDialog, $mdToast, City, File, city, country, Country, NgMap, GeoCoder) {

      var marker, map;
      $scope.objCity = {};
      $scope.isUploadingIcon = false;
      $scope.iconFilename = '';
      $scope.country = country;
      $scope.vm = {};
      $scope.input = {
        latitude:0,
        longitude:0
      };

        if (city) {
        $scope.objCity = city;
        $scope.objCity.countryId = $scope.country.id;
        $scope.isCreating = false;
        $scope.iconFilename = city.icon ? city.icon.name() : "";
        $scope.input.latitude = $scope.objCity.location ? $scope.objCity.location.latitude : $scope.input.latitude;
        $scope.input.longitude = $scope.objCity.location ? $scope.objCity.location.longitude : $scope.input.longitude;
      } else {
        $scope.isCreating = true;
      }

      $scope.onSearchAddressChanged = function () {
        GeoCoder.geocode({
          address: $scope.searchAddress
        }).then(function (result) {
          if (map) {
            var location = result[0].geometry.location;
            location = new google.maps.LatLng(location.lat(), location.lng());
            map.setCenter(location);
            $scope.onMarkerDragEnd({latLng:location});
            map.setZoom(15);
            marker.setPosition(location);
            $scope.input.latitude = location.lat();
            $scope.input.longitude = location.lng();
          }
        });
      };


      // $scope.currentPosition = {
      //   location:[$scope.input.latitude, $scope.input.longitude]
      // }
     
      // $scope.currentPosition.getRadius = function(num) {
      //   var radius = $scope.objCity.radius;
      //   return Math.sqrt(radius) * 100;
      // }
      // // var cityCircle = new google.maps.Circle({
      // //   strokeColor: '#FF0000',
      // //   strokeOpacity: 0.8,
      // //   strokeWeight: 2,
      // //   fillColor: '#FF0000',
      // //   fillOpacity: 0.35,
      // //   map: map,
        ////   center: citymap[city].center,
      // //   radius: Math.sqrt(citymap[city].population) * 100
        //// });

      NgMap.getMap().then(function (objMap) {
          map = objMap;
          marker = map.markers[0];
          google.maps.event.trigger(map, 'resize');

          if (city) {
            var lat = city.location ? city.location.latitude : 0;
            var long = city.location ? city.location.longitude : 0;
            var cityLocation = new google.maps.LatLng(lat, long);
            map.setCenter(cityLocation)
            marker.setPosition(cityLocation);
            map.setZoom(15);
          } else {
            map.setZoom(1);
            map.setCenter(new google.maps.LatLng(0, 0));
          }
      });

      $scope.onMarkerDragEnd = function (ev) {
          var lat = ev.latLng.lat();
          var lng = ev.latLng.lng();
          $scope.objCity.location = new Parse.GeoPoint({
            latitude: lat,
            longitude:  lng
          });
          $scope.input.latitude = lat;
          $scope.input.longitude = lng;
      };

      // $scope.toFixedLength = function (number){
      //   var stringNum = number.toString();
      //   if(stringNum.length > 18) {
      //     number = Number(stringNum.slice(0, 18));
      //   }
      //   return number;
      // }

      $scope.onInputLocationChanged = function () {
          if ($scope.input.latitude && $scope.input.longitude && map) {
              $scope.objCity.location = new Parse.GeoPoint({
              latitude: $scope.input.latitude,
              longitude:  $scope.input.longitude
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

      var showSimpleToast = function (message) {
        $mdToast.show(
          $mdToast.simple()
            .content(message)
            .action('OK')
            .hideDelay(3000)
        );
      };

      $scope.hide = function () {
        $mdDialog.cancel();
      };

      $scope.cancel = function () {
        $mdDialog.cancel();
      };

      $scope.onSaveCity = function (isFormValid) {

        if (!isFormValid) {
          showSimpleToast('City correct all highlighted errors and try again.');

        } else if (!$scope.objCity.icon) {
          showSimpleToast('Upload an icon.');
        } else {
          $scope.objCity.countryId = $scope.country.id;
          City.create($scope.objCity).then(function (city) {
            var dataSaveObj = { country:$scope.country, city: city };

            $scope.saveCityInCountry(dataSaveObj);
            
            showSimpleToast('City saved.');
            $mdDialog.hide();
            $scope.isSavingCity = false;
          },
            function (error) {
              showSimpleToast(error.message);
              $scope.isSavingCity = false;
            });
        }
      };
      
      $scope.saveCityInCountry = function (dataSaveObj) {
        if (dataSaveObj) {
          Country.save(dataSaveObj).then(function (country) {
          },
            function (error) {
              showSimpleToast(error.message);
            });
        }
      };


      $scope.uploadIcon = function (file, invalidFile) {

        if (file) {
          $scope.iconFilename = file.name;
          $scope.isUploadingIcon = true;

          File.upload(file).then(function (savedFile) {
            $scope.objCity.icon = savedFile;
            $scope.isUploadingIcon = false;
            showSimpleToast('Icon uploaded');
          }, function (error) {
            showSimpleToast(error.message);
            $scope.isUploadingIcon = false;
          });
        } else {
          if (invalidFile) {
            if (invalidFile.$error === 'maxSize') {
              showSimpleToast('Icon too big. Max ' + invalidFile.$errorParam);
            } else if (invalidFile.$error === 'dimensions') {
              showSimpleToast('Icon size should be 64x64');
            }
          }
        }
      };

      $scope.onDeleteIcon = function () {
        $scope.isSavingCity = true;
        $scope.objCity.icon = null;
        $scope.iconFilename = null;

        showSimpleToast('Icon deleted.');
        $scope.isSavingCity = false;
      };

      $scope.onUpdateCity = function (isFormValid) {
        if (!isFormValid) {
          showSimpleToast('City correct all highlighted errors and try again');
        } else if (!$scope.objCity.icon) {
          showSimpleToast('Upload an icon');
        } else {
          $scope.isSavingCity = true;

          City.update($scope.objCity).then(function (city) {
            showSimpleToast('City updated');
            $mdDialog.hide();
            $scope.isSavingCity = false;
          }, function (error) {
              showSimpleToast('Error. City not updated.', error.message);
              $scope.isSavingCity = false;
            });
        }
      };
    });
     