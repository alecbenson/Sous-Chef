'use strict';
angular.module('souschef')
	.controller('weekViewController', function ($scope, $http) {

		$scope.refinements = {
			stars: 2,
			efficiency: 2,
			preptime: 2
		};

		//Retrieve weekly recipes
		$http.get('/recipes/7').success(function (result) {
			$scope.weeklyRecipes = result;
		});
	});
