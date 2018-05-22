'use strict';
angular.module('nearPlaceApp')
    .controller('RouteController', function ($scope, $mdToast, $mdDialog, Route, Place, Story, Auth) {

        $scope.route = {};
        $scope.data = {
            selectedIndex: 0
        };
        $scope.relationsPlaces = [];
        $scope.relationsStories = [];
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

        $scope.loadRoute = function (id) {
            Auth.ensureLoggedIn().then(function () {
                $scope.promise = Route.get(id).then(function (route) {
                    $scope.route = route;
                    placesRelFunction(route);
                    storiesRelFunction(route);
                });
            });
        };

        var loadRoute = function (id) {
            $scope.loadRoute(id);
        };

        var placesRelFunction = function (route) {
            if (route) {
                var relation = route.relation('placesRelation');
                var query = relation.query();
                Route.find(query).then(function (places) {
                    $scope.relationsPlaces = places;
                }, function (error) {
                    $scope.relationsPlaces = [];
                });
            }
        };

        var storiesRelFunction = function (route) {
            if (route) {
                var relation = route.relation('storiesRelation');
                var query = relation.query();
                Route.find(query).then(function (stories) {
                    $scope.relationsStories = stories;
                }, function (error) {
                    $scope.relationsStories = [];
                });
            }
        };

        var loadCount = function () {
            Auth.ensureLoggedIn().then(function () {
                Route.count($scope.query).then(function (total) {
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
                onAddPlaceInRoute(ev);
            } else {
                onAddStoryInRoute(ev);
            }
        };

        var onAddPlaceInRoute = function (ev) {
            $mdDialog.show({
                controller: 'DialogAddPlaceInRouteController',
                templateUrl: '/views/partials/route-place.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {
                    route: $scope.route,
                    places: $scope.relationsPlaces.map(function (place) {
                        return place.id;
                    })
                },
                clickOutsideToClose: true
            })
                .then(function (answer) {
                    loadRoute($scope.route.id);
                    loadCount();
                });
        };

        $scope.onEditRouteStory = function (story) {
            $mdDialog.show({
                controller: 'DialogStoryController',
                templateUrl: '/views/partials/story.html',
                parent: angular.element(document.body),
                //  targetEvent: ev,
                locals: {
                    story: angular.copy(story)
                },
                clickOutsideToClose: true
            })
                .then(function (answer) {
                    loadRoute($scope.route.id);
                });
        };

        $scope.sortColumn = "title_ru";
        $scope.reverseSort = false;
        $scope.sortPlace = function (column) {
            $scope.reverseSort = ($scope.sortColumn == column) ? !$scope.reverseSort : false;
            $scope.sortColumn = column;
        };

        $scope.getSortClass = function (column) {
            if ($scope.sortColumn == column) {
                return $scope.reverseSort ? 'keyboard_arrow_down' : 'keyboard_arrow_up'
            }
            return '';
        };

        $scope.onEditRoutePlace = function (place) {
            $mdDialog.show({
                controller: 'DialogPlaceController',
                templateUrl: '/views/partials/place.html',
                parent: angular.element(document.body),
                //targetEvent: ev,
                locals: {
                    place: angular.copy(place)
                },
                clickOutsideToClose: true
            })
                .then(function (answer) {
                    loadRoute($scope.route.id);
                });
        };

        var onAddStoryInRoute = function (ev) {
            $mdDialog.show({
                controller: 'DialogAddStoryInRouteController',
                templateUrl: '/views/partials/route-story.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {
                    route: $scope.route,
                    stories: $scope.relationsStories.map(function (story) {
                        return story.id;
                    })
                },
                clickOutsideToClose: true
            })
                .then(function (answer) {
                    loadRoute($scope.route.id);
                    loadCount();
                });
        };
    }).controller('DialogAddPlaceInRouteController', function ($scope, $mdDialog, $mdToast, Route, Place, File, route, places) {
        $scope.objRoute = route;
        $scope.objRoute.places = [];
        $scope.placesAll = [];

        Place.all({
            page: 1,
            limit: 1000,
            filter: ''
        })
            .then(function (returnedPlaces) {
                $scope.placesAll = returnedPlaces.map(function (place) {
                    if (places.includes(place.id)) {
                        place.selected = true;   

                    }
                    return place;
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

        $scope.addPlaceInRoute = function (isFormValid) {
            var placesSelected = [];
            if (!isFormValid) {
                showToast('Please correct all highlighted errors and try again');
                return;
            } else {
                $scope.isSavingRoute = true;

                $scope.placesAll.forEach(function (place) {
                    if (place.selected) {
                        placesSelected.push(place);
                    } else if (places.includes(place.id)) {
                        var routePlaceDestroy = {
                            place: place,
                            route: route
                        };
                        Route.removePlace(routePlaceDestroy);
                    }
                });

                $scope.objRoute.places = placesSelected;
                
                Route.save($scope.objRoute).then(function (route) {
                    showToast('Route saved');
                    $mdDialog.hide();
                    $scope.isSavingRoute = false;
                }, function (error) {
                    showToast(error.message);
                    $scope.isSavingRoute = false;
                });
            }
        };

    }).controller('DialogAddStoryInRouteController', function ($scope, $mdDialog, $mdToast, Route, Story, File, route, stories) {
        $scope.objRoute = route;
        $scope.objRoute.stories = [];
        $scope.storiesAll = [];

        Story.all({
            page: 1,
            limit: 1000,
            filter: ''
        })
            .then(function (returnedStories) {
                $scope.storiesAll = returnedStories.map(function (story) {
                    if (stories.includes(story.id)) {
                        story.selected = true;
                    }
                    return story;
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

        $scope.addStoryInRoute = function (isFormValid) {
            var storiesSelected = [];
            if (!isFormValid) {
                showToast('Please correct all highlighted errors and try again');
                return;
            } else {
                $scope.isSavingRoute = true;

                $scope.storiesAll.forEach(function (story) {
                    if (story.selected) {
                        storiesSelected.push(story);
                    }
                    else if (stories.includes(story.id)) {
                        var routeStoryDestroy = {
                            story: story,
                            route: route
                        };
                        Route.removeStory(routeStoryDestroy);
                    }
                });

                $scope.objRoute.stories = storiesSelected;

                Route.save($scope.objRoute).then(function (route) {
                    showToast('Route saved');
                    $mdDialog.hide();
                    $scope.isSavingRoute = false;
                },
                    function (error) {
                        showToast(error.message);
                        $scope.isSavingRoute = false;
                    });
            }
        };
    });