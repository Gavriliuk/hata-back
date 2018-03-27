'use strict';

angular.module('nearPlaceApp')

    .controller('SingleCategoryController', function ($scope, $mdToast, $mdDialog, Category, Place,Story, Auth) {
        $scope.category = {};
        $scope.data = {places: []};
        $scope.relationsPlaces = [];
        $scope.relationsStories=[];

        $scope.query = {
            filter: '',
            limit: 40,
            page: 1,
            total: 0
        };

        var showSimpleToast = function (message) {
            $mdToast.show(
                $mdToast.simple()
                    .content(message)
                    .action('OK')
                    .hideDelay(3000)
            );
        };



        $scope.loadCategory = function (id){
            Auth.ensureLoggedIn().then(function () {
                $scope.promise = Category.get(id).then(function (category) {
                    $scope.category = category;
                    $scope.placesRelFunction (category);
                    $scope.storiesRelFunction (category);
                });
            });
        };


        $scope.placesRelFunction = function (category) {
            if (category) {

                var relation = category.relation('placesRelation');
                var query = relation.query();

                Category.find(query).then(function (places) {
                    $scope.relationsPlaces = places;

                }, function (error) {
                    $scope.relationsPlaces = [];
                });
            }
        };

        $scope.storiesRelFunction = function (category) {
            if (category) {

                var relation = category.relation('storiesRelation');
                var query = relation.query();

                Category.find(query).then(function (stories) {
                    $scope.relationsStories = stories;

                }, function (error) {
                    $scope.relationsStories = [];


                });
            }
        };




        var loadCount = function () {
            Auth.ensureLoggedIn().then(function () {
                Category.count($scope.query).then(function (total) {
                    $scope.query.total = total;
                });
            });
        }
        loadCount();

        $scope.openMenu = function ($mdOpenMenu, ev) {
            $mdOpenMenu(ev);
        };


        $scope.onNewSigneCategory = function (ev) {

            $mdDialog.show({
                controller: 'DialogSingleCategoryController',
                templateUrl: '/views/partials/category-single.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {
                    category: $scope.category
                },
                clickOutsideToClose: true
            })
                .then(function (answer) {
                    $scope.loadCategory();
                    loadCount();
                });
        };
//Story category//

$scope.onNewStoryCategory = function(ev){

        $mdDialog.show({
          controller: 'DialogStoryCategoryController',
          templateUrl: '/views/partials/category-story.html',
          parent:angular.element(document.body),
          targetEvent:ev,
          locals:{
            category:$scope.category
          },
          clickOutsideToClose:true
        })
        .then(function(answer){
          $scope.loadCategory();
          loadCount();
        });
      };


//Story//


        $scope.onDestroySinglePlace = function (ev, place, category) {
             var categoryPlaceDestroy ={place: place, category:category};
            var confirm = $mdDialog.confirm()
                .title('Confirm action')
                .content('Are you sure you want to delete this place?')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(ev);

            $mdDialog.show(confirm).then(function () {


                // var eventsQuery = currentCheckin.relation('events').query();
                // eventsQuery.find().then(function(events){
                //
                // })


                Category.destroyPlace(categoryPlaceDestroy).then(function (success) {
                        showSimpleToast('Place deleted.');
                        // loadPlaces();
                        // loadCount();
                    },
                    function (error) {
                        showSimpleToast(error.message);
                    });

            });
        };


        $scope.onDestroySingleStory = function (ev, story, category) {
             var categoryStoryDestroy ={story: story, category:category};
            var confirm = $mdDialog.confirm()
                .title('Confirm action')
                .content('Are you sure you want to delete this story?')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(ev);

            $mdDialog.show(confirm).then(function () {


                // var eventsQuery = currentCheckin.relation('events').query();
                // eventsQuery.find().then(function(events){
                //
                // })


                Category.destroyStory(categoryStoryDestroy).then(function (success) {
                        showSimpleToast('Story deleted.');
                        // loadPlaces();
                        // loadCount();
                    },
                    function (error) {
                        showSimpleToast(error.message);
                    });

            });
        };

})




















.controller('DialogSingleCategoryController', function ($scope, $mdDialog, $mdToast, Category, Place, File, category) {
            $scope.objCategory = {};
            $scope.objCategory.places = [];
            $scope.placesAll = [];
            $scope.isCreating = false;
            $scope.isUploading = false;
            $scope.isUploadingIcon = false;
            $scope.imageFilename = '';
            $scope.iconFilename = '';

            if (category) {

                $scope.isCreating = false;
                $scope.imageFilename = category.image.name();

                if (category.icon) {
                    $scope.iconFilename = category.icon.name();
                }
                $scope.objCategory = category;
            } else {
                $scope.objCategory = {};
                $scope.isCreating = true;
            }

            Place.all({page: 1, limit: 1000, filter: ''})
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

            $scope.AddPlaceSingleCategory = function (isFormValid) {
                var placesSelected = [];
                if (!isFormValid) {
                    showToast('Please correct all highlighted errors and try again');
                    return;
                } else {
                    $scope.isSavingCategory = true;

                    $scope.placesAll.forEach(function (place) {
                        if (place.selected) {
                            placesSelected.push(place);
                        }
                    });
                    $scope.objCategory.places = placesSelected;

                    Category.save($scope.objCategory).then(function (category) {
                        showToast('Category saved');
                        $mdDialog.hide();
                        $scope.isSavingCategory = false;
                    }, function (error) {
                        showToast(error.message);
                        $scope.isSavingCategory = false;
                    });
                }
            };
        })





        //story//

.controller('DialogStoryCategoryController', function ($scope, $mdDialog, $mdToast, Category, Story, File, category) {
              $scope.objCategory = {};
              $scope.objCategory.stories = [];
              $scope.storiesAll = [];





                  $scope.isCreating = false;

                  $scope.objCategory = category;




              Story.all({page: 1, limit: 1000, filter: ''})
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

              $scope.AddStorySingleCategory = function (isFormValid) {

                  if (!isFormValid) {
                      showToast('Please correct all highlighted errors and try again');
                      return;
                  } else {
                      $scope.isSavingCategory = true;


                      $scope.objCategory.stories = $scope.storiesAll.filter(story => story.selected);

                      Category.save($scope.objCategory).then(function (category) {
                          showToast('Category saved');
                          $mdDialog.hide();
                          $scope.isSavingCategory = false;
                      }, function (error) {
                          showToast(error.message);
                          $scope.isSavingCategory = false;
                      });
                  }
              };
          });
