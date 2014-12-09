var request = require('request');
var cheerio = require('cheerio');

var Crawler = function (url, api) {
	this.url = url;
	this.api = api;
};

Crawler.prototype.crawl = function () {
	var _this = this;

	request(this.url, function (err, response, body) {
		_this.processResponse(err, response, body);
	});
};

Crawler.prototype.processResponse = function (err, response, body) {
	// start new crawler
	this.api.onRequestFinishedCallback();
	
	if (err || response.statusCode != 200) {
		return new Error('response status code is not 200');
	}
	
	var contentType = response.headers['content-type'];
	if (!contentType || contentType.indexOf('text/html') === -1) {
		return new Error('response content type is not text/html');
	}

	this.findNewLinks(body);
	this.analyseBody(body);
};

Crawler.prototype.cleanupUrl = function (url, callback) {
	url = url.split('#')[0];

	var httpOrHttps = /^https?:\/\//i;

	if (httpOrHttps.test(url)) {
		return callback(null, url);
	}
	else {
		return callback(new Error('the given url is not an absolute url!'), null);
	}
};

Crawler.prototype.analyseBody = function (body) {
	var $ = cheerio.load(body);
	var title = $('h1').text();

	if (!title) {
		return;
	}

	this.api.saveItem(this.url, title);
};

Crawler.prototype.findNewLinks = function (body) {
	var _this = this;
	var $ = cheerio.load(body);
	var $a = $('a');
		
	$a.map(function (i, el) {
		var href = $(el).attr('href');
		
		if (!href) {
			return;
		}

		_this.cleanupUrl(href, function (err, url) {
			if (!err) {
				_this.api.addToQueue(url);
			}
		});
	});
};

module.exports = Crawler;