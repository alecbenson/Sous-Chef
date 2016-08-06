'use strict';
angular.module('souschef')
	.controller('weekViewController', function ($scope, $http) {

		$scope.refinements = {
			stars: 1,
			efficiency: 1,
			preptime: 1
		};

		//Retrieve weekly recipes
		$http.get('/recipes/7').success(function (result) {
			$scope.weeklyRecipes = result;
		});
	});
