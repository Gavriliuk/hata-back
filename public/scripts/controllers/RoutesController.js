'use strict';

angular.module('nearPlaceApp')
	.controller('RoutesCtrl', function ($scope, $mdDialog, Route, Place, Auth) {
		// Pagination options.
		$scope.rowOptions = [10, 20, 40];

		$scope.query = {
			filter: '',
			limit: 40,
			page: 1,
			total: 0
		};

		$scope.routes = [];


		//Order by//

$scope.sortColumn = "title_ru";
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


		var loadRoutes = function () {
			Auth.ensureLoggedIn().then(function () {
				$scope.promise = Route.all($scope.query).then(function (routes) {
					$scope.routes = routes;
				});
			});
		}

		loadRoutes();

		var loadCount = function () {
			Auth.ensureLoggedIn().then(function () {
				Route.count($scope.query).then(function (total) {
					$scope.query.total = total;
				});
			});
		}

		loadCount();

		$scope.onSearch = function () {
			$scope.query.page = 1;
			$scope.query.total = 0;
			loadRoutes();
			loadCount();
		};

		$scope.onPaginationChange = function (page, limit) {
			$scope.query.page = page;
			$scope.query.limit = limit;
			loadRoutes();
		};

		$scope.openMenu = function ($mdOpenMenu, ev) {
			$mdOpenMenu(ev);
		};

		$scope.onNewRoute = function (ev) {

			$mdDialog.show({
				controller: 'DialogRouteController',
				templateUrl: '/views/partials/route.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				locals: {
					route: null
				},
				clickOutsideToClose: true
			})
				.then(function (answer) {
					loadRoutes();
					loadCount();
				});
		};

		$scope.onEditRoute = function (ev, route) {

			$mdDialog.show({
				controller: 'DialogRouteController',
				templateUrl: '/views/partials/route.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				locals: {
					route: angular.copy(route)
				},
				clickOutsideToClose: true
			})
				.then(function (answer) {
					loadRoutes();
				});
		};

		$scope.onDestroyRoute = function (ev, route) {

			var confirm = $mdDialog.confirm()
				.title('Confirm action')
				.content('Are you sure you want to delete this route? Places of this route will be deleted.')
				.ok('Delete')
				.cancel('Cancel')
				.targetEvent(ev);

			$mdDialog.show(confirm).then(function () {

				Route.destroy(route.id).then(function (success) {
					loadRoutes();
					loadCount();
				}, function (error) {
					showSimpleToast(error.message);
				});

			});
		};
	})

	.controller('DialogRouteController',
		function ($scope, $mdDialog, $mdToast, Route, Place, File, route) {
			$scope.placesAll = [];
			$scope.objRoute = {};
			$scope.objRoute.places = [];
			$scope.objRoute.periods = [];
			$scope.objRoute.placesRelation = {};

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

				if (!$scope.objRoute.periods) {
					$scope.objRoute.periods = [];
				}

			} else {
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

			$scope.uploadImage = function (file, invalidFile) {

				if (file) {
					$scope.imageFilename = file.name;
					$scope.isUploading = true;

					File.upload(file).then(function (savedFile) {
						$scope.objRoute.image = savedFile;
						$scope.isUploading = false;
						showToast('Image uploaded');
					},
						function (error) {
							showToast(error.message);
							$scope.isUploading = false;
						});
				} else {
					if (invalidFile) {
						if (invalidFile.$error === 'maxSize') {
							showToast('Image too big. Max ' + invalidFile.$errorParam);
						}
					}
				}
			};

			$scope.onDeleteImage = function () {
				$scope.isSavingRoute = true;
				$scope.objRoute.image = null;
				$scope.imageFilename = null;


				showToast('Image deleted.');
				$scope.isSavingRoute = false;
			};

			$scope.onDeleteIcon = function () {
				$scope.isSavingRoute = true;
				$scope.objRoute.icon = null;
				$scope.iconFilename = null;


				showToast('Icon deleted.');
				$scope.isSavingRoute = false;
			};


			$scope.uploadIcon = function (file, invalidFile) {

				if (file) {
					$scope.iconFilename = file.name;
					$scope.isUploadingIcon = true;

					File.upload(file).then(function (savedFile) {
						$scope.objRoute.icon = savedFile;
						$scope.isUploadingIcon = false;
						showToast('Icon uploaded');
					}, function (error) {
						showToast(error.message);
						$scope.isUploadingIcon = false;
					});
				} else {
					if (invalidFile) {
						if (invalidFile.$error === 'maxSize') {
							showToast('Icon too big. Max ' + invalidFile.$errorParam);
						} else if (invalidFile.$error === 'dimensions') {
							showToast('Icon size should be 64x64');
						}
					}
				}
			};

			$scope.onSaveRoute = function (isFormValid) {

				if (!isFormValid) {
					showToast('Please correct all highlighted errors and try again');
					return;

				} else if (!$scope.objRoute.image) {
					showToast('Upload an image');
				} else {

					$scope.isSavingRoute = true;

					Route.create($scope.objRoute).then(function (route) {
						showToast('Route saved');
						$mdDialog.hide();
						$scope.isSavingRoute = false;
					}, function (error) {
						showToast(error.message);
						$scope.isSavingRoute = false;
					});
				}

			};



			$scope.onUpdateRoute = function (isFormValid) {

				if (!isFormValid) {
					showToast('Please correct all highlighted errors and try again');
				} else if (!$scope.objRoute.image) {
					showToast('Upload an image');
				} else {

					$scope.isSavingRoute = true;




					Route.update($scope.objRoute).then(function (route) {
						showToast('Route updated');
						$mdDialog.hide();
						$scope.isSavingRoute = false;
					}, function (error) {
						showToast(error.message);
						$scope.isSavingRoute = false;
					});
				}
			};

		});
