'use strict';
angular.module('nearPlaceApp')
	.controller('CountriesCtrl', function ($scope, $mdToast, $mdDialog, Country, Auth, City) {
		$scope.rowOptions = [10, 20, 40];
		$scope.query = {
			filter: '',
			limit: 40,
			page: 1,
			total: 0
		};
		$scope.countries = [];
		$scope.sortColumn = "title_ru";
		$scope.reverseSort = false;
		$scope.sortData = function (column) {
			$scope.reverseSort = ($scope.sortColumn == column) ? !$scope.reverseSort : false;
			$scope.sortColumn = column;
		};

		$scope.getSortClass = function (column) {
			if ($scope.sortColumn == column) {
				return $scope.reverseSort ? 'keyboard_arrow_down' : 'keyboard_arrow_up'
			}
			return '';
		};

		var loadCountries = function () {
			Auth.ensureLoggedIn().then(function () {
				$scope.promise = Country.all($scope.query).then(function (countries) {
					$scope.countries = countries;
				});
			});
		};

		loadCountries();

		var loadCount = function () {
			Auth.ensureLoggedIn().then(function () {
				Country.count($scope.query).then(function (total) {
					$scope.query.total = total;
				});
			});
		};

		loadCount();

		$scope.onSearch = function () {
			$scope.query.page = 1;
			$scope.query.total = 0;
			loadCountries();
			loadCount();
		};

		$scope.onPaginationChange = function (page, limit) {
			$scope.query.page = page;
			$scope.query.limit = limit;
			loadCountries();
		};

		$scope.openMenu = function ($mdOpenMenu, ev) {
			$mdOpenMenu(ev);
		};

		$scope.onNewCountry = function (ev) {
			$mdDialog.show({
				controller: 'DialogCountryController',
				templateUrl: '/views/partials/country.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				locals: {
					country: null
				},
				clickOutsideToClose: true
			})
				.then(function (answer) {
					loadCountries();
					loadCount();
				});
		};

		$scope.onEditCountry = function (ev, country) {
			$mdDialog.show({
				controller: 'DialogCountryController',
				templateUrl: '/views/partials/country.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				locals: {
					country: angular.copy(country)
				},
				clickOutsideToClose: true
			})
				.then(function (answer) {
					loadCountries();
				});
		};

		$scope.onDestroyCountry = function (ev, country) {
			var confirm = $mdDialog.confirm()
				.title('Confirm action')
				.content('Are you sure you want to delete this country? Cities of this country will be deleted.')
				.ok('Delete')
				.cancel('Cancel')
				.targetEvent(ev);
			$mdDialog.show(confirm).then(function () {
				$scope.removeCitiesInCurrentCountry(country);
				Country.destroy(country.id).then(function (success) {
					loadCountries();
					loadCount();
				}, function (error) {
					showSimpleToast(error.message);
				});
			});
		};

		$scope.removeCitiesInCurrentCountry = function (country) {
			Country.destroyAllCities(country).then(function (success) {
				showSimpleToast('All cities in this country have been deleted.');
			}, function (error) {
				showSimpleToast('Error. All cities not deleted.', error.message);
			});
		};

		var showSimpleToast = function (message) {
			$mdToast.show(
				$mdToast.simple()
					.content(message)
					.action('OK')
					.hideDelay(3000)
			);
		};


	}).controller('DialogCountryController', function ($scope, $mdDialog, $mdToast, Country, City, File, country) {
			$scope.citiesAll = [];
			$scope.objCountry = {};
			$scope.objCountry.cities = [];
			$scope.objCountry.periods = [];
			$scope.isCreating = false;
			$scope.isUploading = false;
			$scope.isUploadingIcon = false;
			$scope.iconFilename = '';
			$scope.playModes = [{ label: 'Poi Only', value: "poiOnly" }, { label: 'Story Only', value: "storyOnly" }, { label: 'Story Poi', value: "storyPoi" }];

			if (country) {
				$scope.isCreating = false;
				$scope.iconFilename = country.icon ? country.icon.name() : "";
				$scope.objCountry = country;
				if (!$scope.objCountry.periods) {
					$scope.objCountry.periods = [];
				}

			} else {
				$scope.isCreating = true;
			}

			City.all({ page: 1, limit: 1000, filter: '' })
				.then(function (cities) {
					$scope.citiesAll = cities;
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
					$scope.isUploading = true;

					File.upload(file).then(function (savedFile) {
						$scope.objCountry.image = savedFile;
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

			$scope.onDeleteIcon = function () {
				$scope.isSavingCountry = true;
				$scope.objCountry.icon = null;
				$scope.iconFilename = null;

				showToast('Icon deleted.');
				$scope.isSavingCountry = false;
			};


			$scope.uploadIcon = function (file, invalidFile) {
				if (file) {
					$scope.iconFilename = file.name;
					$scope.isUploadingIcon = true;

					File.upload(file).then(function (savedFile) {
						$scope.objCountry.icon = savedFile;
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

			$scope.onSaveCountry = function (isFormValid) {
				if (!isFormValid) {
					showToast('Please correct all highlighted errors and try again');
					return;
				} else {
					$scope.isSavingCountry = true;
					Country.create($scope.objCountry).then(function (country) {
						showToast('Country saved');
						$mdDialog.hide();
						$scope.isSavingCountry = false;
					}, function (error) {
						showToast(error.message);
						$scope.isSavingCountry = false;
					});
				}
			};

			$scope.onUpdateCountry = function (isFormValid) {

				if (!isFormValid) {
					showToast('Please correct all highlighted errors and try again');
				} else {
					$scope.isSavingCountry = true;
					Country.update($scope.objCountry).then(function (country) {
						showToast('Country updated');
						$mdDialog.hide();
						$scope.isSavingCountry = false;
					}, function (error) {
						showToast(error.message);
						$scope.isSavingCountry = false;
					});
				}
			};
		});
