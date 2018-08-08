'use strict';
angular.module('nearPlaceApp')
  .controller('BundleCtrl',
    function ($scope, $element, $mdDialog, $mdToast, Bundle, Route, Auth) {
      $scope.rowOptions = [10, 20, 40];

      $scope.query = {
        filter: '',
        limit: 40,
        sortColumn: '',
        reverseSort: false,
        page: 1,
        total: 0,
        status: null,
        startDate: null,
        endDate: null
      };
      $scope.bundles = [];
      $scope.bundles.productId = '';

      $scope.toggleSelectAll = function (ev) {
        $scope.bundles.forEach(function (bundle) {
          bundle.selected = ev;
        });
      }
      $scope.sortColumn = "title_ru";
      $scope.sortData = function (column) {
        $scope.query.reverseSort = ($scope.query.sortColumn == column) ? !$scope.query.reverseSort : false;
        $scope.query.sortColumn = column;
        loadBundles();
        loadCount();
      }

      $scope.getSortClass = function (column) {
        if ($scope.query.sortColumn == column) {
          return $scope.query.reverseSort ? 'keyboard_arrow_down' : 'keyboard_arrow_up'
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

      var loadBundles = function () {
        Auth.ensureLoggedIn().then(function () {
          $scope.promise = Bundle.all($scope.query).then(function (bundles) {
            $scope.bundles = bundles.map(function (promoCd) {
              promoCd.selected = false;
              promoCd.productId = 'com.innapp.dromos.bundle.';
              return promoCd;
            })
          });
        });
      };

      loadBundles();

      var loadCount = function () {
        Auth.ensureLoggedIn().then(function () {
          Bundle.count($scope.query).then(function (total) {
            $scope.query.total = total;
          });
        });
      }
      loadCount();

      $scope.onQueryChange = function () {
        $scope.query.page = 1;
        $scope.query.total = 0;
        loadBundles();
        loadCount();
      }

      $scope.onCreateBundle = function (ev) {
        $mdDialog.show({
          controller: 'DialogBundleController',
          templateUrl: '/views/partials/bundle.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          locals: {
            bundle: null
          },
          clickOutsideToClose: true
        })
          .then(function (answer) {
            loadBundles();
            loadCount();
          });
      };

      $scope.onPaginationChange = function (page, limit) {
        $scope.query.page = page;
        $scope.query.limit = limit;
        loadBundles();
      };

      $scope.openMenu = function ($mdOpenMenu, ev) {
        $mdOpenMenu(ev);
      };

      $scope.isDate = function (date) {
        return angular.isDate(date);
      };

      $scope.onUpdateBundle = function (ev, bundle) {
        var objBundle = angular.copy(bundle);
        $mdDialog.show({
          controller: 'DialogBundleController',
          templateUrl: '/views/partials/bundle.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          locals: {
            bundle: objBundle
          },
          clickOutsideToClose: true
        }).then(function (answer) {
          loadBundles();
          loadCount();
        });;
      };

      $scope.onDestroyBundle = function (ev, bundle) {
        var confirm = $mdDialog.confirm()
          .title('Confirm action')
          .content('Are you sure you want to delete this bundle?')
          .ok('Delete')
          .cancel('Cancel')
          .targetEvent(ev);

        $mdDialog.show(confirm).then(function () {
          Bundle.destroy(bundle).then(function (success) {
            showSimpleToast('Bundle deleted.');
            loadBundles();
            loadCount();
          },
            function (error) {
              showSimpleToast(error.message);
            });
        });
      };

      $scope.onDowlandBundles = function (ev) {
        var csvContent = '';
        var cvsBundlesHeader = '';
        var cvsBundlesValues = '';

        cvsBundlesHeader = Bundle.getAllAttributes().join(';') + '\n';

        Route.all({}).then(function (routes) {

          $scope.bundles.forEach(function (bundle, index, infoArray, ) {
            if (bundle.selected) {
              Bundle.getAllAttributes().forEach(function (attributeName) {
                if (attributeName == 'route' && bundle.attributes[attributeName]) {
                  if (bundle.attributes[attributeName][0] != "all") {
                    cvsBundlesValues += bundle.attributes[attributeName].map(function (routeId) {
                      return routes.find(function (value) {
                        return routeId == value.id;
                      }).title_ru;

                    }) + ';'
                  } else {
                    cvsBundlesValues += bundle.attributes[attributeName] + ";"
                  }
                }
                else {
                  cvsBundlesValues += bundle.attributes[attributeName] + ';';
                }
              });
              cvsBundlesValues += '\n';
            }
          });
          csvContent += cvsBundlesHeader + cvsBundlesValues;
          downloadFile(csvContent, 'Bundles.csv');

        });
        function downloadFile(content, fileName, strMimeType) {
          var D = document;
          var a = D.createElement('a');
          strMimeType = strMimeType || 'application/octet-stream;charset=utf-8';
          var rawFile;
          if (navigator.msSaveBlob) {
            return navigator.msSaveBlob(new Blob([content], {
              type: strMimeType
            }), fileName);

          } if ('download' in a) {
            var blob = new Blob([content], {
              type: strMimeType
            });
            rawFile = URL.createObjectURL(blob);
            a.setAttribute('download', fileName);
          } else {
            rawFile = 'content:' + strMimeType + ',' + encodeURIComponent(content);
            a.setAttribute('target', '_blank');
          }
          a.href = rawFile;
          a.setAttribute('style', 'display:none;');
          D.body.appendChild(a);
          setTimeout(function () {
            if (a.click) {
              a.click();

            } else if (document.createEvent) {
              var eventObj = document.createEvent('MouseEvents');
              eventObj.initEvent('click', true, true);
              a.dispatchEvent(eventObj);
            }
            D.body.removeChild(a);

          }, 100);
        }
      };

      $scope.onDestroyBundles = function (ev) {
        var confirm = $mdDialog.confirm()
          .title('Confirm action')
          .content('Are you sure you want to delete this bundles?')
          .ok('Delete')
          .cancel('Cancel')
          .targetEvent(ev);

        $mdDialog.show(confirm).then(function () {
          var bundleDeleted = [];
          $scope.bundles.forEach(function (bundles) {
            if (bundles.selected) {
              bundleDeleted.push(Bundle.destroy(bundles));
            };
          });

          Promise.all(bundleDeleted).then(function () {
            loadBundles();
            loadCount();
          })
        });
      };
    }).controller('DialogBundleController', function ($scope, $mdDialog, $mdToast, Bundle, File, bundle, Route) {

      var loadRouties = function () {
        $scope.promise = Route.all({}).then(function (routies) {
          $scope.routies = routies;

        });
      };
      loadRouties();

      $scope.isCreating = true;

      if (bundle) {
        $scope.bundle = bundle;
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

      $scope.onSaveBundle= function (isFormValid) {
        if (!isFormValid) {
          showSimpleToast('Please correct all highlighted errors and try again');
        } else {
            Bundle.create($scope.bundle).then(function (success) {
              showSimpleToast('Bundle saved');
              $mdDialog.hide();
              $scope.isSavingBundle = false;
            },
              function (error) {
                showSimpleToast(error.message);
                $scope.isSavingBundle = false;
              });
          }
      };

      $scope.onUpdateBundle = function (isFormValid) {
        if (!isFormValid) {
          showSimpleToast('Please correct all highlighted errors and try again');
        } else {
          $scope.isSavingBundle = true;

          Bundle.update($scope.bundle).then(function (bundle) {
            showSimpleToast('Bundle updated');
            $mdDialog.hide();
            $scope.isSavingBundle = false;

            loadBundles();
            loadCount();
          },
            function (error) {
              showSimpleToast('Error. Bundle not updated.', error.message);
              $scope.isSavingBundle = false;
            });
        }
      };
    });