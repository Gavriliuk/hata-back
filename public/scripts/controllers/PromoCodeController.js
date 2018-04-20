'use strict';

angular.module('nearPlaceApp')
  .controller('PromocodeCtrl',
    function ($scope, $mdDialog, $mdToast, Promocode, Route, Auth) {

      // Pagination options
      $scope.rowOptions = [10, 20, 40];

      $scope.query = {
        filter: '',
        limit: 40,
        page: 1,
        total: 0,
        status: null,
        startDate: null,
        endDate: null
      };

      $scope.promocodes = [];




      //Order by//

      $scope.sortColumn = "title";
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
      //Order by //



      var showSimpleToast = function (message) {
        $mdToast.show(
          $mdToast.simple()
            .content(message)
            .action('OK')
            .hideDelay(3000)
        );
      };

      var loadPromocodes = function () {
        Auth.ensureLoggedIn().then(function () {
          $scope.promise = Promocode.all($scope.query).then(function (promocodes) {
            $scope.promocodes = promocodes;
          });
        });
      };

      loadPromocodes();

      var loadCount = function () {
        Auth.ensureLoggedIn().then(function () {
          Promocode.count($scope.query).then(function (total) {
            $scope.query.total = total;
          });
        });
      }

      loadCount();

      $scope.onQueryChange = function () {
        $scope.query.page = 1;
        $scope.query.total = 0;
        loadPromocodes();
        loadCount();
      }

      $scope.onCreatePromocode = function (ev) {

        $mdDialog.show({
          controller: 'DialogPromocodeController',
          templateUrl: '/views/partials/promocode.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          locals: {
            promocode: null
          },
          clickOutsideToClose: true
        })
          .then(function (answer) {
            loadPromocodes();
            loadCount();
          });
      };

      $scope.onPaginationChange = function (page, limit) {
        $scope.query.page = page;
        $scope.query.limit = limit;
        loadPromocodes();
      };

      $scope.openMenu = function ($mdOpenMenu, ev) {
        $mdOpenMenu(ev);
      };

      $scope.isDate = function (date) {
        return angular.isDate(date);
      }

      $scope.onUpdateExpiresAt = function (ev, promocode) {

        $mdDialog.show({
          controller: 'DialogPromocodeExpiresAtController',
          templateUrl: '/views/partials/expiration-modal.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          locals: {
            promocode: promocode
          }
        });

      }

      $scope.onUpdatePromocode = function (ev, promocode) {

        var objPromocode = angular.copy(promocode);

        $mdDialog.show({
          controller: 'DialogPromocodeController',
          templateUrl: '/views/partials/promocode.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          locals: {
            promocode: objPromocode
          },
          clickOutsideToClose: true
        });
      };

      $scope.onDestroyPromocode = function (ev, promocode) {

        var confirm = $mdDialog.confirm()
          .title('Confirm action')
          .content('Are you sure you want to delete this promocode?')
          .ok('Delete')
          .cancel('Cancel')
          .targetEvent(ev);

        $mdDialog.show(confirm).then(function () {

          Promocode.destroy(promocode).then(function (success) {
            showSimpleToast('Promocode deleted.');
            loadPromocodes();
            loadCount();
          },
            function (error) {
              showSimpleToast(error.message);
            });

        });
      };

      $scope.onUpdateIsApproved = function (promocode, isApproved) {
        if (promocode.isUsed) {
          showSimpleToast('No Changes approved after used');
          return;
        }
        promocode.isApproved = isApproved;
        promocode.unset('expiresAt');

        Promocode.update(promocode).then(function (success) {
          showSimpleToast('Promocode updated');
        }, function (error) {
          showSimpleToast('There was an error');
        });

      };
      $scope.onUpdateIsUsed = function (promocode, isUsed) {

        promocode.isUsed = isUsed;
        // promocode.unset('expiresAt');

        Promocode.update(promocode).then(function (success) {
          showSimpleToast('Promocode updated');
        }, function (error) {
          showSimpleToast('There was an error');
        });

      };

    }).controller('DialogPromocodeController', function ($scope, $mdDialog, $mdToast, Promocode, File, promocode, Route) {


      var loadRouties = function () {
        $scope.promise = Route.all({}).then(function (routies) {
          $scope.routies = routies;
          console.log(routies);

        });

      };
      loadRouties();

      $scope.promocode = {};
      $scope.howMany = 1;

      $scope.isCreating = true;

      if (promocode) {

        $scope.promocode = promocode;

        $scope.isCreating = false;
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

      $scope.onSavePromocode = function (isFormValid) {

        if (!isFormValid) {
          showSimpleToast('Please correct all highlighted errors and try again');
        } else {

          if ($scope.howMany > 1) {
            var promises = [];
            var title = $scope.promocode.title;
            for (var i = 1; i <= $scope.howMany; i++) {
              $scope.promocode.title = i + " - " + title;
              promises.push(Promocode.create($scope.promocode));
            }
            Promise.all(promises).then(function (values) {
              showSimpleToast('All Promocodes saved');
              $mdDialog.hide();
              $scope.isSavingPromocode = false;
            }, function (error) {
              showSimpleToast(error.message);
              $scope.isSavingPromocode = false;
            });
          } else {
            Promocode.create($scope.promocode).then(function (success) {
              showSimpleToast('Promocode saved');
              $mdDialog.hide();
              $scope.isSavingPromocode = false;
            },
              function (error) {
                showSimpleToast(error.message);
                $scope.isSavingPromocode = false;
              });
          }
        }
      };

      $scope.onUpdatePromocode = function (isFormValid) {
        if (!isFormValid) {
          showSimpleToast('Please correct all highlighted errors and try again');
        } else {

          $scope.isSavingPromocode = true;

          Promocode.update($scope.promocode).then(function (promocode) {
            showSimpleToast('Promocode updated');
            $mdDialog.hide();
            $scope.isSavingPromocode = false;
          },
            function (error) {
              showSimpleToast('Error. Promocode not updated.', error.message);
              $scope.isSavingPromocode = false;
            });

        }
      };

    })
  .controller('DialogPlaceExpiresAtController',
    function ($scope, $mdDialog, $mdToast, Promocode, promocode) {

      $scope.promocode = promocode;
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
        promocode.expiresAt = expiresAt;
        promocode.isApproved = true;

        $scope.isSavingExpiresAt = true;

        Promocode.update(promocode).then(function (success) {
          $scope.isSavingExpiresAt = false;
          showToast('Promocode updated');
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
              var transformedInput = text.repromocode(/[^0-9]/g, '');

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
