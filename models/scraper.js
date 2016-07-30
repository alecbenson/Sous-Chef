'use strict';

var Promise = require('bluebird');
var cheerio = require('cheerio');
var request = require('request');
var winston = require('winston');

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
	return new Promise((resolve) => {
		request(url, function (err, response, html) {
			if (err) {
				winston.log('error', 'Could not scrape ' + url + ' ' + err);
			}

			var $ = cheerio.load(html);
			var title, ingredients, readyTime, directions, image;

			image = $('img[itemprop=image]').attr('src');
			title = $('h1[itemprop=name]').text();
			readyTime = $('span.ready-in-time').text();

			var ingredients = [];
			$('span[itemprop=ingredients]').each((i, elem) => {
				ingredients.push($(elem).text());
			})
			directions = [];
			$('span.recipe-directions__list--item').each((i, elem) => {
				directions.push($(elem).text());
			});

			var recipe = {
				title: title,
				url: url,
				image: image,
				ingredients: ingredients,
				readyTime: readyTime,
				directions: directions
			}
			resolve(recipe);
		});
	})
};

saveRecipe('http://allrecipes.com/recipe/135799/chicken-breast-cutlets-with-artichokes-and-capers/');

module.exports = {};
