'use strict';
angular.module('souschef')
	.controller('navbarController', function ($scope) {
		$scope.title = 'Sous-Chef';
		$scope.dragging = false;
		$scope.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	});
