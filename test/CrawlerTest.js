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

	describe ('#findNewLinks', function () {

		it ('should correctly add two links to the queue', function () {
			var addToQueue = sinon.spy();
			var crawler = new Crawler('http://foo.bar', {
				addToQueue: addToQueue
			});

			var links = '<a href="http://foo.bar">Test1</a><a href="http://bar.foo">Test2</a>';

			crawler.findNewLinks(links);

			addToQueue.calledTwice.should.be.true;
			addToQueue.getCall(0).calledWith('http://foo.bar');
			addToQueue.getCall(1).calledWith('http://bar.foo');
		});

		it ('should not add an empty link to the queue', function () {
			var addToQueue = sinon.spy();
			var crawler = new Crawler('http://foo.bar', {
				addToQueue: addToQueue
			});

			var links = '<a href="">Test1</a>';

			crawler.findNewLinks(links);

			addToQueue.called.should.be.false;
		});

		it ('should not add a link to the queue if the #cleanupUrl function returned an error', function () {
			Crawler.prototype.cleanupUrl = function (url, callback) {
				return callback(new Error(), null);
			};

			var addToQueue = sinon.spy();
			var crawler = new Crawler('http://foo.bar', {
				addToQueue: addToQueue
			});

			crawler.findNewLinks('<a href="invalidLink">Test</a>');

			addToQueue.called.should.be.false;
		});
	});

	describe ('#processResponse', function () {
		it ('should call the onRequestFinishedCallback', function () {
			var onRequestFinishedCallback = sinon.spy();

			var crawler = new Crawler('http://foo.bar', {
				onRequestFinishedCallback: onRequestFinishedCallback
			});

			crawler.processResponse(null, {}, null);
			onRequestFinishedCallback.calledOnce.should.be.true;
		});

		it ('should return an error if the response status is not 200', function () {
			var crawler = new Crawler('http://foo.bar', {
				onRequestFinishedCallback: function () {}
			});

			var error = crawler.processResponse(null, {
				statusCode: 404
			}, null);

			error.should.be.an.instanceOf(Error);
			error.message.should.equal('response status code is not 200');
		});

		it ('should return an error if the content type is not text/html', function () {
			var crawler = new Crawler('http://foo.bar', {
				onRequestFinishedCallback: function () {}
			});

			var error = crawler.processResponse(null, {
				statusCode: 200,
				headers: {
					'content-type': 'image/jpg'
				}
			}, null);

			error.should.be.an.instanceOf(Error);
			error.message.should.equal('response content type is not text/html');
		});

		it ('should pass the body to #findNewLinks and #analyseBody', function () {
			var crawler = new Crawler('http://foo.bar', {
				onRequestFinishedCallback: function () {}
			});

			Crawler.prototype.findNewLinks = sinon.spy();
			Crawler.prototype.analyseBody = sinon.spy();

			var body = '<html><head><title>Test</title></head><body>Test</body></html>';

			var error = crawler.processResponse(null, {
				statusCode: 200,
				headers: {
					'content-type': 'text/html'
				}
			}, body);

			crawler.findNewLinks.calledOnce.should.be.true;
			crawler.findNewLinks.calledWith(body);

			crawler.analyseBody.calledOnce.should.be.true;
			crawler.analyseBody.calledWith(body);
			(error === undefined).should.be.true;
		});

	});
});

