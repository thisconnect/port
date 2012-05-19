Station
=======

Runs an audio engine and provides a socket connection to pass and receive data.

Setup
-----

	git submodule update --init --recursive
	cd node_modules/ws/
	make

Run
---

	node lib/station/station.js

Run tests
---------

	node tests/runner.js

Requires
--------
  - [Pd 0.43](http://crca.ucsd.edu/~msp/software.html)
  - [node.js 0.6.x](http://nodejs.org/)
