'use strict';

angular.module('souschef', ['ngMaterial'])
	.config(function ($mdThemingProvider) {
		$mdThemingProvider.theme('default')
			.primaryPalette('red')
			.accentPalette('deep-orange')
      .backgroundPalette('grey');
	});
