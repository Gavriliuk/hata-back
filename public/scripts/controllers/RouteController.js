'use strict';

angular.module('nearPlaceApp')

    .controller('RouteController', function ($scope, $mdToast, $mdDialog, Route, Place, Story, Auth) {
        $scope.route = {};
        $scope.data = { selectedIndex: 0 };
        $scope.relationsPlaces = [];
        $scope.relationsStories = [];

        $scope.query = {
            filter: '',
            limit: 40,
            page: 1,
            total: 0
        };

//Order by//

$scope.sortColumn = "name";
$scope.reverseSort = false;

$scope.sortData = function(column){
$scope.reverseSort = ($scope.sortColumn == column) ? !$scope.reverseSort : false;
$scope.sortColumn = column;

}
$scope.getSortClass = function(column){
    if ($scope.sortColumn == column){
        return $scope.reverseSort ? 'keyboard_arrow_down' : 'keyboard_arrow_up'

    }
    return '';
};

//Order by //









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
        }

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
        }
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
        }
        var onAddPlaceInRoute = function (ev) {

            $mdDialog.show({
                controller: 'DialogAddPlaceInRouteController',
                templateUrl: '/views/partials/route-place.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {
                    route: $scope.route
                },
                clickOutsideToClose: true
            })
                .then(function (answer) {
                    loadRoute($scope.route.id);
                    loadCount();
                });
        };

        //Story route//

        $scope.onEditRouteStory = function (story) {
            $mdDialog.show({
                controller: 'DialogStoryController',
                templateUrl: '/views/partials/story.html',
                parent: angular.element(document.body),
                // targetEvent: ev,
                locals: {
                    story: angular.copy(story)
                },
                clickOutsideToClose: true
            })
                .then(function (answer) {
                    loadRoute($scope.route.id);
                });
        };




//Order by//

$scope.sortColumn = "title_ru";
$scope.reverseSort = false;

$scope.sortPlace = function(column){
$scope.reverseSort = ($scope.sortColumn == column) ? !$scope.reverseSort : false;
$scope.sortColumn = column;

}
$scope.getSortClass = function(column){
    if ($scope.sortColumn == column){
        return $scope.reverseSort ? 'keyboard_arrow_down' : 'keyboard_arrow_up'
    }
    return '';
};
//Order by //


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

        //Schimabari//
        var onAddStoryInRoute = function (ev) {

            $mdDialog.show({
                controller: 'DialogAddStoryInRouteController',
                templateUrl: '/views/partials/route-story.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {
                    route: $scope.route
                },
                clickOutsideToClose: true
            })
                .then(function (answer) {
                    loadRoute($scope.route.id);
                    loadCount();
                });
        };

        //Story//
        $scope.onDestroySinglePlace = function (ev, place, route) {
            var routePlaceDestroy = { place: place, route: route };
            var confirm = $mdDialog.confirm()
                .title('Confirm action')
                .content('Are you sure you want to delete this place?')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(ev);

            $mdDialog.show(confirm).then(function () {

                Route.removePlace(routePlaceDestroy).then(function (success) {
                    showSimpleToast('Place deleted.');

                    loadRoute($scope.route.id);
                    loadCount();
                },
                    function (error) {
                        showSimpleToast(error.message);
                    });
            });
        };

        $scope.onDestroySingleStory = function (ev, story, route) {
            var routeStoryDestroy = { story: story, route: route };
            var confirm = $mdDialog.confirm()
                .title('Confirm action')
                .content('Are you sure you want to delete this story?')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(ev);

            $mdDialog.show(confirm).then(function () {

                Route.removeStory(routeStoryDestroy).then(function (success) {
                    showSimpleToast('Story deleted.');
                    loadRoute($scope.route.id);
                    loadCount();
                },
                    function (error) {
                        showSimpleToast(error.message);
                    });

            });
        };

    })

    .controller('DialogAddPlaceInRouteController', function ($scope, $mdDialog, $mdToast, Route, Place, File, route) {
        $scope.objRoute = {};
        $scope.objRoute.places = [];
        $scope.placesAll = [];
        $scope.isCreating = false;
        $scope.isUploading = false;
        $scope.isUploadingIcon = false;
        $scope.imageFilename = '';
        $scope.iconFilename = '';

        if (route) {

            $scope.isCreating = false;
            $scope.imageFilename = route.image.name();

            if (route.icon) {
                $scope.iconFilename = route.icon.name();
            }
            $scope.objRoute = route;
        } else {
            $scope.objRoute = {};
            $scope.isCreating = true;
        }

        Place.all({ page: 1, limit: 1000, filter: '' })
            .then(function (places) {
                $scope.placesAll = places;
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
    })
    //story//
    .controller('DialogAddStoryInRouteController', function ($scope, $mdDialog, $mdToast, Route, Story, File, route) {
        $scope.objRoute = {};
        $scope.objRoute.stories = [];
        $scope.storiesAll = [];

        $scope.isCreating = false;
        $scope.objRoute = route;

        Story.all({ page: 1, limit: 1000, filter: '' })
            .then(function (stories) {
                $scope.storiesAll = stories;
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
            if (!isFormValid) {
                showToast('Please correct all highlighted errors and try again');
                return;
            } else {
                $scope.isSavingRoute = true;


                $scope.objRoute.stories = $scope.storiesAll.filter(story => story.selected);

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

    });
