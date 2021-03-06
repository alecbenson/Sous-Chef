'use strict';
angular.module('souschef')
	.controller('contentController', function ($scope, $http) {
		$scope.filterText = '';

		var initRefinements = function () {
			$http.get('/refinements').success(function (refinements) {
				if (!refinements) {
					$scope.refinements = {
						stars: 0,
						efficiency: 0,
						readyTime: 0,
						madeCount: 0,
						reviews: 0
					};
					$scope.saveRefinements();
				} else {
					$scope.refinements = refinements;
				}
			});
		}

		$scope.saveRefinements = function () {
			$http.post('/refinements', $scope.refinements)
				.success(function () {
					console.log('saved!');
				})
		}

		//Retrieve scored recipes
		var getSortedRecipes = function () {
			$http.get('/recipes/scored/anchor/10/0/' + encodeURIComponent($scope.filterText)).success(function (result) {
				$scope.weeklyRecipes = result;
			});
		}

		//Update the list of recipes, save refinements
		$scope.updateList = function () {
			$scope.saveRefinements();
			getSortedRecipes();
		}

		$scope.$watch('filterText', function() {
			getSortedRecipes();
		});

		initRefinements();
		getSortedRecipes();

	});
