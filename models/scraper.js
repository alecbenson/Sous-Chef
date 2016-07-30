'use strict';

var Promise = require('bluebird');
var cheerio = require('cheerio');
var request = require('request');
var winston = require('winston');

var Recipes = require('./recipes');
var Ingredients = require('./ingredients');
var Directions = require('./directions');

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

var saveRecipe = function (url) {
	request(url, function (err, response, html) {
		if (err) {
			winston.log('error', 'Could not scrape ' + url + ' ' + err);
		}

		var $ = cheerio.load(html);
		var title, readyTime, image, stars, reviews;

		image = $('img[itemprop=image]').attr('src');
		title = $('h1[itemprop=name]').text();
		readyTime = $('span.ready-in-time').text();
		stars = parseFloat($('div.rating-stars').data('ratingstars'));
		reviews = parseInt($('span.review-count').text())

		var promises = [];
		$('span[itemprop=ingredients]').each((i, elem) => {
			var ingredient = new Ingredients({
				url: url,
				name: $(elem).text()
			});
			promises.push(ingredient.save);
		});

		$('span.recipe-directions__list--item').each((i, elem) => {
			var direction = new Directions({
				url: url,
				step: $(elem).text()
			});
			promises.push(direction.save);
		});

		var recipe = new Recipes({
			url: url,
			title: title,
			image: image,
			readyTime: readyTime,
			stars: stars,
			reviews: reviews
		});
		promises.push(recipe.save);
		return Promise.all(promises);
	});
};

var exportRecipes = function (pages) {
	return harvestRecipes(pages).map((url) => {
		return saveRecipe(url);
	});
}

exportRecipes(1).then((r) => {
	console.log(r);
})

module.exports = exportRecipes;
