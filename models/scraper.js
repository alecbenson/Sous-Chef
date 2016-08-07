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
	return result;
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

		var promises = [];
		$('span[itemprop=ingredients]').each((i, elem) => {
			var ingredient = new Ingredients({
				url: url,
				name: $(elem).text()
			});
			promises.push(ingredient.save());
		});

		$('span.recipe-directions__list--item').each((i, elem) => {
			var direction = new Directions({
				url: url,
				step: $(elem).text()
			});
			promises.push(direction.save());
		});

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
		promises.push(recipe.save());
		winston.info('Scraping recipe: ' + title);
		return Promise.all(promises);
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
