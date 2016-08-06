'use strict';
angular.module('souschef')
	.controller('weekViewController', function ($scope, $http) {

		$scope.refinements = {
			stars: 2,
			efficiency: 2,
			preptime: 2,
			somethingnew: 2
		};

		$scope.saveRefinements = function () {
			$http.post('/refinements', $scope.refinements)
				.success(function () {
					console.log('saved!');
				})
		}

		var initRefinements = function () {
			$http.get('/refinements').success(function (refinements) {
				if (!refinements) {
					$scope.refinements = {
						stars: 2,
						efficiency: 2,
						preptime: 2,
						somethingnew: 2
					};
				} else {
					$scope.refinements = refinements;
				}
			});
		}

		initRefinements();

		//Retrieve weekly recipes
		$http.get('/recipes/7').success(function (result) {
			$scope.weeklyRecipes = result;
		});
	});
