var should = require('should');

var Crawler = require('../src/Crawler');

describe('Crawler test suite', function () {

	it ('should correctly create a new crawler', function () {
		var crawler = new Crawler('http://spiegel.de', {});

		crawler.should.be.an.instanceOf(Crawler);
		crawler.url.should.equal('http://spiegel.de');
	});

	describe ('#cleanupUrl', function () {

		it ('should correctly return an error if the url is not an absolute path', function (done) {
			var crawler = new Crawler('', {});

			crawler.cleanupUrl('foo/index.html', function (err, url) {
				err.should.be.an.instanceOf(Error);
				err.message.should.equal('the given url is not an absolute url!');
				(url === null).should.be.true;

				done();
			});
		});

	});
});