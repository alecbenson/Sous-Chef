'use strict';

angular.module('souschef').directive('starRating', function () {
	return {
		link: link,
		template: '<span ng-repeat="star in getFullStarCount(recipe.stars) track by $index"><i class="fa fa-star text-warning"></i></span>' +
			'<span ng-repeat="star in getHalfStarCount(recipe.stars) track by $index"><i class="fa fa-star-half-o text-warning"></i></span>'
	};

	function link(scope) {
		scope.getFullStarCount = function (stars) {
			return new Array(Math.floor(stars));
		};
		scope.getHalfStarCount = function (stars) {
			var difference = Math.round(stars - Math.floor(stars));
			return new Array(difference);
		};
	}
});
