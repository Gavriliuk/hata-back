'use strict';
angular.module('nearPlaceApp')
    .controller('CityController', function ($scope, $mdToast, $mdDialog, City, Route, Auth) {
        
        $scope.city = {};
        $scope.data = {
            selectedIndex: 0
        };
        $scope.relationsRoutes = [];
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

        $scope.loadCity = function (id) {
            Auth.ensureLoggedIn().then(function () {
                $scope.promise = City.get(id).then(function (city) {
                    if (city) {
                      $scope.city = city;
                      routesRelFunction(city);
                    }
                });
            });
        };
        var loadCity = function (id) {
            $scope.loadCity(id);
        };

        var routesRelFunction = function (city) {
            if (city) {
                var relation = city.relation('routesRelation');
                var query = relation.query();
                City.find(query).then(function (routes) {
                    $scope.relationsRoutes = routes;
                    console.log('RELATIONS',$scope.relationsRoutes);
                }, function (error) {
                    $scope.relationsRoutes = [];
                });
            }
        };

        var loadCount = function () {
            Auth.ensureLoggedIn().then(function () {
              City.count($scope.query).then(function (total) {
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
                onAddRouteInCity(ev);
            }
        };

        var onAddRouteInCity = function (ev) {
            $mdDialog.show({
                controller: 'DialogAddRouteInCityController',
                templateUrl: '/views/partials/city-routes.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {
                  city: $scope.city,
                    routes: $scope.relationsRoutes.map(function (route) {
                        return route.id;
                    })
                },
                clickOutsideToClose: true
            })
                .then(function (answer) {
                    loadCity($scope.city.id);
                    loadCount();
                });
        };

        $scope.sortColumn = "title_ru";
        $scope.reverseSort = false;
        $scope.sortRoute = function (column) {
            $scope.reverseSort = ($scope.sortColumn == column) ? !$scope.reverseSort : false;
            $scope.sortColumn = column;
        };

        $scope.getSortClass = function (column) {
            if ($scope.sortColumn == column) {
                return $scope.reverseSort ? 'keyboard_arrow_down' : 'keyboard_arrow_up'
            }
            return '';
        };

        $scope.onEditCityInRoute = function (route) {
            $mdDialog.show({
                controller: 'DialogRouteController',
                templateUrl: '/views/partials/route.html',
                parent: angular.element(document.body),
                locals: {
                  route: angular.copy(route)
                },
                clickOutsideToClose: true
            })
                .then(function (answer) {
                    loadCity($scope.city.id);
                });
        };
 }).controller('DialogAddRouteInCityController', function ($scope, $mdDialog, $mdToast, City, Route, city, routes) {

        $scope.objCity = {};
        $scope.routesAll = [];
        if ( city ) {
          $scope.objCity = city;
          $scope.objCity.routes = []; 
        }

        Route.all({
            page: 1,
            limit: 1000,
            filter: ''
          }).then(function (returnedRoutes) {
            $scope.routesAll = returnedRoutes.map(function (route) {
              if (routes.includes(route.id)) {
                route.selected = true; 
              }
              return route;
            });
        });

        var showToast = function (message) {
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

        $scope.addRouteInCity = function (isFormValid) {
            var routesSelected = [];
            if (!isFormValid) {
                showToast('Please correct all highlighted errors and try again');
                return;
            } else {
                $scope.isSavingCity = true;

                $scope.routesAll.forEach(function (route) {
                    if (route.selected) {
                      routesSelected.push(route);
                    } else if (routes.includes(route.id)) {
                        var cityRouteDestroy = {
                          route: route,
                          city: city
                        };
                        City.removeRoute(cityRouteDestroy);
                    }
                });
                $scope.objCity.routes = routesSelected;

                City.save($scope.objCity).then(function (city) {
                    console.log('SAVE-CITY', city)
                    showToast('City saved');
                    $mdDialog.hide();
                    $scope.isSavingCity = false;
                }, function (error) {
                    showToast(error.message);
                    $scope.isSavingCity = false;
                });
            }
        };

    });
