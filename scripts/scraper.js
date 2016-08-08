'use strict';

var Promise = require('bluebird');
var cheerio = require('cheerio');
var request = require('request');
var winston = require('winston');

var Recipes = require('../models/recipes');
var Ingredients = require('../models/ingredients');
var Directions = require('../models/directions');
var Ingredient_Relations = require('../models/ingredient_relations');

var scrapeDinnerPage = function (page) {
	var dinnerPage = 'http://allrecipes.com/recipes/80/main-dish/?page=' + parseInt(page);
	return grabRecipeLinks(dinnerPage);
}

var grabRecipeLinks = function (url) {
	return new Promise((resolve) => {
		request(url, function (err, response, html) {
			if (err) {
				winston.log('error', 'Could not scrape ' + url + ' ' + err);
			}

			var $ = cheerio.load(html);
			var links = {};
			//Get all hrefs on the dinner page
			$('a[href]').each((i, elem) => {
				const link = $(elem).attr('href');
				//Find the actual recipe links
				if (link && link.match(/^\/recipe\/[0-9]+\//)) {
					links['http://allrecipes.com' + link] = 0;
				}
			});
			//Dedup links
			resolve(Object.keys(links));
		});
	})
}

var harvestRecipes = function (pages) {
	var unique = {};
	var promises = [];

	for (var i = 1; i <= pages; i++) {
		promises.push(scrapeDinnerPage(i));
	}
	//Concatenate and dedupe
	return Promise.all(promises).reduce((prev, cur) => {
		return prev.concat(cur);
	}, []).then((all) => {
		for (let recipe of all) {
			unique[recipe] = 0;
		}
		return Object.keys(unique);
	});
}

var grabCoreIngredients = function (ingredientLine) {
	//Keywords that we are not interested in storing in ingredient_relations
	var filterWords = ['cup', 'cups', 'chop', 'chopped', 'dice', 'diced', 'salt', 'pepper', 'oz',
			'ounce', 'ounces', 'tsp', 'tsps', 'teaspoon', 'teaspoons', 'tbs', 'tablespoon',
			'tablespoons', 'slice', 'slices', 'sliced', 'softened', 'thin', 'thinly', 'gallon', 'gallons',
			'finely', 'grate', 'grated', 'taste', 'large', 'medium', 'small', 'dried', 'extra',
			'seasoned', 'seasoning', 'such', 'as', 'or', 'to', 'and', 'dash', 'sauce', 'sea', 'virgin',
			'cubed', 'cubes', 'halves', 'divide', 'divided', 'lightly', 'beaten', 'shredded', 'round',
			'peel', 'peeled', 'pinch', 'inch', 'needed', 'dry', 'jar', 'box', 'drain', 'drained',
			'fresh', 'water', 'crush', 'crushed', 'mince', 'minced', 'seeded', 'lengthwise', 'can',
			'for', 'topping', 'more', 'ground', 'crumbled', 'pound', 'pounds', 'powder', 'cold', 'black',
			'juice', 'frozen', 'diluted', 'undiluted', 'of', 'condensed', 'optional', 'cut', 'into', 'chunks',
			'sprig', 'sprigs', 'pot', 'stalk', 'stalks', 'paste', 'cooked', 'baked', 'unbaked', 'casing', 'long',
			'seeds', 'seed', 'pounded', 'mix', 'jars'
		]
		//Lowercase, a-z only.
	var alphaOnly = ingredientLine.toLowerCase().replace(/[^a-z ]/g, '').trim();
	//Split on words
	var split = alphaOnly.split(' ');
	var i = split.length;
	//Iterate in reverse to prevent splicing from wrecking indexes
	while (i--) {
		var word = split[i];
		if (filterWords.indexOf(word) !== -1) {
			//Pull the unwanted words out
			split.splice(i, 1);
		}
	}
	return split;
}

var parseReadyTime = function (timestring) {
	var result = 0;
	var dayIndex = timestring.indexOf('d');
	var hourIndex = timestring.indexOf('h');
	var minuteIndex = timestring.indexOf('m');
	var lastIndex = 0;

	if (dayIndex !== -1) {
		var days = parseInt(timestring.substring(0, dayIndex).replace(/\D/g, ''));
		lastIndex = dayIndex;
		result += 24 * 60 * days;
	}
	if (hourIndex !== -1) {
		var hours = parseInt(timestring.substring(lastIndex, hourIndex).replace(/\D/g, ''));
		lastIndex = hourIndex;
		result += hours * 60;
	}
	if (minuteIndex !== -1) {
		var minutes = parseInt(timestring.substring(lastIndex, minuteIndex).replace(/\D/g, ''));
		result += minutes
	}
	//default to 45 if the recipe has no time or something went wrong
	return result || 45;
}

var saveRecipe = function (url) {
	request(url, function (err, response, html) {
		if (err) {
			winston.log('error', 'Could not scrape ' + url + ' ' + err);
		}

		var $ = cheerio.load(html);
		var title, readyTime, image, stars, reviews, description;

		image = $('img[itemprop=image]').attr('src');
		title = $('h1[itemprop=name]').text();
		description = $('div[itemprop=description]').text();
		readyTime = parseReadyTime($('span.ready-in-time').text());
		stars = parseFloat($('div.rating-stars').data('ratingstars'));
		reviews = parseInt($('span.review-count').text())

		winston.info('Scraping recipe: ' + title);
		var recipe = new Recipes({
			url: url,
			title: title,
			image: image,
			readyTime: readyTime,
			stars: stars,
			description: description,
			reviews: reviews,
			madeCount: 0,
			notes: ''
		});

		return recipe.save().then(function (model) {
			var promises = [];
			//Store each ingredient line so we can display the full recipe
			$('span[itemprop=ingredients]').each((i, elem) => {
				var ingredientLine = $(elem).text();
				var ingredient = new Ingredients({
					recipe_id: model.id,
					name: ingredientLine
				});
				promises.push(ingredient.save());
				var coreIngredients = grabCoreIngredients(ingredientLine);

				//Store core ingredients that belong to a recipe in a separate table
				for (let ing of coreIngredients) {
					var ingRelation = new Ingredient_Relations({
						recipe_id: model.id,
						name: ing
					});
					promises.push(ingRelation.save());
				}
			});

			$('span.recipe-directions__list--item').each((i, elem) => {
				var direction = new Directions({
					recipe_id: model.id,
					step: $(elem).text()
				});
				promises.push(direction.save());
			});
			return Promise.all(promises);
		});
	});
};

var exportRecipes = function (pages) {
	return harvestRecipes(pages).map((url) => {
		return saveRecipe(url);
	});
}

exportRecipes(50).then(() => {
	console.log('done');
});

module.exports = exportRecipes;
