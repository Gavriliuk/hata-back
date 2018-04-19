'use strict';

angular.module('nearPlaceApp')
  .controller('CategoryCtrl',
    function ($scope, $mdDialog, $mdToast,Category, Auth) {

      // Pagination options
      $scope.rowOptions = [10, 20, 40];

      $scope.query = {
        filter: '',
        limit: 40,
        page: 1,
        total: 0,
        startDate: null,
        endDate: null
      };

      $scope.categories = [];


      //Order by//

      $scope.sortColumn = "title_ru";
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

      //Order by//

      var showSimpleToast = function (message) {
        $mdToast.show(
          $mdToast.simple()
          .content(message)
          .action('OK')
          .hideDelay(3000)
        );
      };

      var loadCategories = function () {
        Auth.ensureLoggedIn().then(function () {
          $scope.promise = Category.all($scope.query).then(function (categories) {
            $scope.categories = categories;
          });
        });
      };

      loadCategories();

      var loadCount = function () {
        Auth.ensureLoggedIn().then(function () {
          Category.count($scope.query).then(function (total) {
            $scope.query.total = total;
          });
        });
      }

      loadCount();

      $scope.onQueryChange = function () {
        $scope.query.page = 1;
        $scope.query.total = 0;
        loadCategories();
        loadCount();
      }

      $scope.onCreateCategory = function (ev) {

        $mdDialog.show({
            controller: 'DialogCategoryController',
            templateUrl: '/views/partials/category.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            locals: {
              category: null
            },
            clickOutsideToClose: true
          })
          .then(function (answer) {
            loadCategories();
            loadCount();
          });
      };

      $scope.onPaginationChange = function (page, limit) {
        $scope.query.page = page;
        $scope.query.limit = limit;
        loadCategories();
      };

      $scope.openMenu = function ($mdOpenMenu, ev) {
        $mdOpenMenu(ev);
      };

  
      $scope.onUpdateCategory = function (ev, category) {

        var objCategory= angular.copy(category);

        $mdDialog.show({
          controller: 'DialogCategoryController',
          templateUrl: '/views/partials/category.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          locals: {
            category: objCategory
          },
          clickOutsideToClose: true
        });
      };

      $scope.onDestroyCategory = function (ev, category) {

        var confirm = $mdDialog.confirm()
          .title('Confirm action')
          .content('Are you sure you want to delete this category?')
          .ok('Delete')
          .cancel('Cancel')
          .targetEvent(ev);

        $mdDialog.show(confirm).then(function () {

          Category.destroy(category).then(function (success) {
              showSimpleToast('Category deleted.');
              loadCategories();
              loadCount();
            },
            function (error) {
              showSimpleToast(error.message);
            });

        });
      };

   

    }).controller('DialogCategoryController', function ($scope, $mdDialog, $mdToast, Category,  File, category) {

      $scope.objCategory = {};
     
      $scope.isUploadingIcon = false;
      $scope.iconFilename = '';
      
    if (category) {
      $scope.isCreating = false;

   
      $scope.iconFilename = category.icon ? category.icon.name():"";
      $scope.objCategory=category;
 
   } else {

    $scope.isCreating = true;

  }


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

    $scope.onSaveCategory = function (isFormValid) {

      if (!isFormValid) {
        showSimpleToast('Category correct all highlighted errors and try again');

      }else if (!$scope.objCategory.icon ) {
        showSimpleToast('Upload an icon');
      } else {
        

        Category.create($scope.objCategory).then(function (category) {
            showSimpleToast('Category saved');
            $mdDialog.hide();
            $scope.isSavingCategory = false;
          },
          function (error) {
            showSimpleToast(error.message);
            $scope.isSavingCategory = false;
          });
      }
    };

    $scope.uploadIcon = function (file, invalidFile) {

      if (file) {
        $scope.iconFilename = file.name;
        $scope.isUploadingIcon = true;

        File.upload(file).then(function (savedFile) {
          $scope.objCategory.icon = savedFile;
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
				$scope.isSavingCategory = true;
				$scope.objCategory.icon = null;
				$scope.iconFilename = null;


				showSimpleToast('Icon deleted.');
				$scope.isSavingCategory = false;
			};



    $scope.onUpdateCategory = function (isFormValid) {
      if (!isFormValid) {
        showSimpleToast('Category correct all highlighted errors and try again');
      } else {

        $scope.isSavingCategory = true;

        Category.update($scope.objCategory).then(function (category) {
            showSimpleToast('Category updated');
            $mdDialog.hide();
            $scope.isSavingCategory = false;
          },
          function (error) {
            showSimpleToast('Error. Category not updated.', error.message);
            $scope.isSavingCategory = false;
          });

      }
    };
});