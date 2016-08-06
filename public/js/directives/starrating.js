'use strict';

angular.module('souschef').directive('starRating', function () {
	return {
		link: link,
		template: '<h4><span ng-repeat="star in getFullStarCount(recipe.stars) track by $index"><i class="fa fa-star warn"></i></span>' +
			'<span ng-repeat="star in getHalfStarCount(recipe.stars) track by $index"><i class="fa fa-star-half-o warn"></i></span>' +
			'<span ng-repeat="star in getEmptyStarCount(recipe.stars) track by $index"><i class="fa fa-star-o warn"></i></span></h4>'
	};

	function link(scope) {
		scope.getFullStarCount = function (stars) {
			return new Array(Math.floor(stars));
		};
		scope.getHalfStarCount = function (stars) {
			var difference = Math.round(stars - Math.floor(stars));
			return new Array(difference);
		};
		scope.getEmptyStarCount = function (stars) {
			var difference = 5 - Math.round(stars);
			return new Array(difference);
		};
	}
});
