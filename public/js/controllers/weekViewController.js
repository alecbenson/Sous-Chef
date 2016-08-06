'use strict';
angular.module('souschef')
	.controller('weekViewController', function ($scope, $http) {

		//Retrieve weekly recipes
		$http.get('/recipes/7').success(function (result) {
			$scope.weeklyRecipes = result;
		});
	});
