var should = require('should');

var Crawler = require('../src/Crawler');

describe('Crawler test suite', function () {

	it ('should correctly create a new crawler', function () {
		var crawler = new Crawler('http://spiegel.de', {});

		crawler.should.be.an.instanceOf(Crawler);
		crawler.url.should.equal('http://spiegel.de');
	});
});