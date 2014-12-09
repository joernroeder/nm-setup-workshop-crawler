nm-setup-workshop-crawler
=========================


## setup

Setup database and run program

```
$ cd working-dir/src
$ redis-server
$ node index.js
```

## tests

Start test suite

```
$ cd working-dir
$ mocha
```

## coverage

Create coverage report

```
$ cd working-dir
$ mocha --reporter html-cov > coverage.html
```

## post pull

Install dependencies

```
$ cd working-dir
$ npm install
```