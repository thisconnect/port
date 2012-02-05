Station
=======

Runs an audio engine and provides a socket connection to pass and receive data.

Run
---

	sh launch.sh

Setup
-----

	git submodule update --init --recursive
	cd node_modules/ws/
	make

Requires
--------
  - [Pd](http://crca.ucsd.edu/~msp/software.html)
  - [node.js](http://nodejs.org/)

Todo
----

  - add public api to send and receive data
