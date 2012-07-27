Station
=======

Runs an audio engine and provides a socket connection to pass and receive data.

Setup
-----

	git submodule update --init --recursive
	npm install

Example
-------

	cd station/
	node
	station = require('./station')
	new station([options])

Run tests
---------

	node tests/runner.js

Requires
--------
  - [Pure Data](http://crca.ucsd.edu/~msp/software.html)
  - [node.js](http://nodejs.org/)
