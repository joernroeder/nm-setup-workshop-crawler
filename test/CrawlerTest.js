var should = require('should');
var sinon = require('sinon');

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

		describe ('should correctly return url', function () {

			it ('with https', function (done) {
				var crawler = new Crawler('', {});

				crawler.cleanupUrl('https://foo.de/index.html', function (err,url) {
					(err === null).should.be.true;
					url.should.equal('https://foo.de/index.html');
					done();
				});			
			});

			it ('with http', function (done) {
				var crawler = new Crawler('', {});

				crawler.cleanupUrl('http://foo.de/index.html', function (err,url) {
					(err === null).should.be.true;
					url.should.equal('http://foo.de/index.html');
					done();
				});		
			});
		});
					
		it ('should correctly remove the hash', function (done) {
			var crawler = new Crawler('', {});
			crawler.cleanupUrl('http://www.spiegel.de/#/foob', function (err, url) {
				(err === null).should.be.true;
				url.should.equal('http://www.spiegel.de/');

				done();
			});

		});
	});
	
	describe ('#analyseBody', function () {
		it ('analyses body for contents of h1 elements', function () {
			var saveItem = sinon.spy();
			var crawler = new Crawler('http://foo.bar', {
				saveItem: saveItem
			});

			crawler.analyseBody('<h1>Foo</h1>');

			saveItem.calledOnce.should.be.true;
			saveItem.calledWith('http://foo.bar', 'Foo');
		});

		it ('should not save an empty title', function () {
			var saveItem = sinon.spy();
			var crawler = new Crawler('http://foo.bar', {
				saveItem: saveItem
			});

			crawler.analyseBody('<h1></h1>');

			saveItem.called.should.be.false;
		});
	});
});

