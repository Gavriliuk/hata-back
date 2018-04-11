'use strict';

angular.module('nearPlaceApp')
    .controller('StoryCtrl', function ($scope, $mdDialog, Story, Auth,) {

        // Pagination options.
        $scope.rowOptions = [10, 20, 40];

        $scope.query = {
            filter: '',
            limit: 40,
            page: 1,
            total: 0,
            startDate: null,
            endDate: null
        };

        $scope.stories = [];


        $scope.onPaginationChange = function (page, limit) {
            $scope.query.page = page;
            $scope.query.limit = limit;
            loadStories();
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




        var loadStories = function () {
            Auth.ensureLoggedIn().then(function () {
                $scope.promise = Story.all($scope.query).then(function (stories) {
                    $scope.stories = stories;
                });
            });
        };

        loadStories();

        var loadCount = function () {
            Auth.ensureLoggedIn().then(function () {
                Story.count($scope.query).then(function (total) {
                    $scope.query.total = total;
                });
            });
        }

        loadCount();

        $scope.onQueryChange = function () {
            $scope.query.page = 1;
            $scope.query.total = 0;
            loadStories();
            loadCount();
        }



        $scope.onCreateStory = function (ev) {

            $mdDialog.show({
                controller: 'DialogStoryController',
                templateUrl: '/views/partials/story.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {
                    story: null
                },
                clickOutsideToClose: true
            })
                .then(function (answer) {
                    loadStories();
                    loadCount();
                });
        };


        $scope.onPaginationChange = function (page, limit) {
            $scope.query.page = page;
            $scope.query.limit = limit;
            loadStories();
        };



        $scope.openMenu = function ($mdOpenMenu, ev) {
            $mdOpenMenu(ev);
        };

        $scope.isDate = function (date) {
            return angular.isDate(date);
        }


        $scope.onEditStory = function (ev, story) {

            $mdDialog.show({
                controller: 'DialogStoryController',
                templateUrl: '/views/partials/story.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {
                    story: angular.copy(story)
                },
                clickOutsideToClose: true
            })
                .then(function (answer) {
                    loadStories();
                });
        };

        $scope.onDestroyStory = function (ev, story) {

            var confirm = $mdDialog.confirm()
                .title('Confirm action')
                .content('Are you sure you want to delete this story? Places of this story will be deleted.')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(ev);

            $mdDialog.show(confirm).then(function () {

                Story.destroy(story.id).then(function (success) {
                    loadStories();
                    loadCount();
                }, function (error) {
                    showSimpleToast(error.message);
                });

            });
        };

    }).controller('DialogStoryController',
        function ($scope, $mdDialog, $mdToast, Story, File, story) {
            $scope.isCreating = false;
            $scope.isUploading = false;

            $scope.audioFilename = {};
            $scope.isAudioUploading = {
                ru: false,
                ro: false,
                en: false
            };

            $scope.objStory = {};

            if (story) {

                $scope.isCreating = false;
                $scope.objStory = story;
            }

            else {

                $scope.isCreating = true;

            }

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



            $scope.uploadAudio = function (file, invalidFile, lang) {

                if (file) {

                    $scope.isAudioUploading[lang] = true;
                    $scope.audioFilename[lang] = file.name;

                    File.uploadAudio(file).then(function (savedFile) {

                        $scope.objStory['audio_' + lang] = savedFile;
                        $scope.isAudioUploading[lang] = false;
                        showToast('Audio uploaded');
                    },
                        function (error) {
                            $scope.isAudioUploading[lang] = false;
                            showToast(error.message);
                        });
                } else {
                    if (invalidFile) {
                        if (invalidFile.$error === 'maxSize') {
                            showToast('Audio too big. Max ' + invalidFile.$errorParam);
                        }
                    }
                }
            };

            $scope.onSaveStory = function (isFormValid) {

                if (!isFormValid) {
                    showToast('Please correct all highlighted errors and try again');
                    return;

                } else if (!$scope.objStory.audio_ru) {
                    showToast('Upload an ru audio');
                } else {

                    $scope.isSavingStory = true;

                    Story.create($scope.objStory).then(function (story) {
                        showToast('Story saved');
                        $mdDialog.hide();
                        $scope.isSavingStory = false;
                    }, function (error) {
                        showToast(error.message);
                        $scope.isSavingStory = false;
                    });
                }

            };

            $scope.onDeleteAudio = function (lang) {
                $scope.isSavingStory = true;
                $scope.objStory['audio_' + lang] = null;
                $scope.audioFilename[lang] = null;
                showToast('Audio deleted.');
                $scope.isSavingStory = false;


            };

            $scope.onUpdateStory = function (isFormValid) {

                if (!isFormValid) {
                    showToast('Please correct all highlighted errors and try again');
                } else if (!$scope.objStory.audio_ru) {
                    showToast('Upload an ru audio');
                } else {

                    $scope.isSavingStory = true;

                    Story.update($scope.objStory).then(function (story) {
                        showToast('Story updated');
                        $mdDialog.hide();
                        $scope.isSavingStory = false;
                    }, function (error) {
                        showToast(error.message);
                        $scope.isSavingStory = false;
                    });
                }
            };

        });
