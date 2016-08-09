'use strict';

var Promise = require('bluebird');
var cheerio = require('cheerio');
var request = require('request');
var winston = require('winston');
var natural = require('natural');
natural.PorterStemmer.attach();

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
	var resultMap = {};
	var stemTrie = new natural.Trie();
	stemTrie.addStrings(['cup', 'chop', 'dice', 'salt', 'oz', 'ounc', 'tsp', 'teaspoon', 'tb',
		'tablespoon', 'slice', 'soften', 'thin', 'thinli', 'gallon', 'fine', 'grate', 'tast',
		'larg', 'medium', 'small', 'dri', 'extra', 'season', 'dash', 'sauc', 'sea', 'virgin',
		'cube', 'halv', 'divid', 'lightli', 'beaten', 'shred', 'round', 'peel', 'pinch', 'inch',
		'need', 'dry', 'jar', 'box', 'drain', 'fresh', 'water', 'crush', 'minc', 'seed', 'lengthwi',
		'top', 'ground', 'crumbl', 'pound', 'powder', 'cold', 'black', 'juic', 'frozen', 'dilut',
		'undilut', 'conden', 'option', 'cut', 'chunk', 'sprig', 'pot', 'stalk', 'past', 'cook',
		'bake', 'unbak', 'case', 'long', 'mix', 'melt', 'uncook', 'rin', 'broken', 'matchstick',
		'bunch', 'trim', 'bite'
	]);
	//Lowercase, a-z only.
	var alphaOnly = ingredientLine.toLowerCase().replace(/[^a-z ]/g, '').trim();
	//Split on words
	var split = alphaOnly.tokenizeAndStem();
	//Iterate in reverse to prevent splicing from wrecking indexes
	for (let word of split) {
		if (!stemTrie.contains(word)) {
			resultMap[word] = 0;
		}
	}
	//Extract unique items from map
	return Object.keys(resultMap);
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
