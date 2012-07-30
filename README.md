Station
=======

Runs an audio engine and provides a socket connection to send and receive data.

Setup
-----

	git submodule update --init --recursive
	npm install

Example
-------

	cd station/
	node
	var station = require('./station')
	station([options])

Options
-------



Run tests
---------

	node tests/runner.js

Requires
--------
  - [Pure Data](http://crca.ucsd.edu/~msp/software.html)
  - [node.js](http://nodejs.org/)
