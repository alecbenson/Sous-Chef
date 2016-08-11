'use strict';
angular.module('souschef')
	.controller('contentController', function ($scope, $http) {

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

		var RecipeItems = function () {
			this.loadedPages = {};
			this.numItems = 500;
			this.pageSize = 10;
			getSortedRecipes();
		}

		RecipeItems.prototype.getItemAtIndex = function (index) {
			var pageNumber = Math.floor(index / this.pageSize);
			var page = this.loadedPages[pageNumber];
			if (page) {
				return page[index % this.pageSize];
			} else if (page !== null) {
				this.fetchPage_(pageNumber);
			}
		};

		RecipeItems.prototype.getLength = function () {
			return this.numItems;
		};

		RecipeItems.prototype.fetchPage_ = function (pageNumber) {
			this.loadedPages[pageNumber] = null;
			var pageOffset = pageNumber * this.pageSize;
			var _this = this;
			$http.get('/recipes/scored/anchor/' + _this.pageSize + '/' + pageOffset).success(function (result) {
				_this.loadedPages[pageNumber] = [];
				_this.loadedPages[pageNumber] = result;
			});
		}

		var getSortedRecipes = function (offset) {
			$http.get('/recipes/scored/anchor/10/' + offset).success(function (result) {
				$scope.weeklyRecipes = result;
			});
		}

		//Update the list of recipes, save refinements
		$scope.updateList = function () {
			$scope.saveRefinements();
			getSortedRecipes();
			$scope.recipeItems = new RecipeItems();
		}
		initRefinements();
		$scope.recipeItems = new RecipeItems();
	});
