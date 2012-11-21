Station
=======

Runs an audio engine and provides a socket connection to send and receive data.


Example
-------

```js
var Station = require('station');

var pd = Station({
	read: 8004,
	write: 8005,
	flags: ['-noprefs', '-nogui', '-send', 'run 1', '-open', './mypatch.pd']
});

pd.create();

pd.on('connect', function(){
	this.write('Hello Pd!;\n');
	this.destroy();
});
```


Methods
-------

### Constructor: Station

```js
var pd = Station(options);
```
or

```js
var pd = Station();
```

#### Options:

	- `host` - the domain of the Pd process. Defaults to localhost.
	- `read` - the port number for Pd's [netsend] to send data to the Station. Defaults to null.
	- `write` - the port number for Station to send data to Pd's [netreceive]. Defaults to null.
	- `pd` - the command or location to spawn the Pd process. Defaults to an absolute path to the Pd binary on OS X. Defaults to pd on Linux.
	- `flags` - the command line arguments for the Pd process. Expects an array of arguments. Read more about Pd's configuration flags on http://crca.ucsd.edu/~msp/Pd_documentation/x3.htm#s4 . Defaults to ['-noprefs', '-stderr', './station.pd']
	- `encoding` - the default encoding of the read and write socket, http://nodejs.org/api/stream.html#stream_stream_setencoding_encoding . WARNING: subject to change: in future versions null might expose the Buffer. Defaults to 'ascii'.



### Method: Station.create

Spawns the Pd process. Wait for incoming socket connection then connect to write socket (if port options are not null).

```js
pd.create();
```


### Method: Station.destroy

Kills the Pd process and ends all open connections. 

```js
pd.destroy();
```


### Method: Station.write

Sends a paket containing one or many messages to Pd's [netreceive]. 

```js
pd.write('Hello Pd!;\n');
```

#### Arguments:

1. Message (string) - the packet to send to the write socket. FUDI messages have to end with `;\n`



Events
------

Station is an event emitter see also http://nodejs.org/api/events.html



### Event: listening

Fires after Station.create is called and read port is specified. At this point Station is waiting for an incoming connection from Pd's [netsend].

```js
pd.on('listening', function(){ });
```



### Event: connection

Fires when Pd's [netsend] connects to the read port. 

```js
pd.on('connection', function(socket){ });
```

#### Arguments:

1. Exposes the socket object



### Event: connect

Fires when Station connects to Pd's [netreceive] on the write port. 

```js
pd.on('connect', function(socket){ });
```

#### Arguments:

1. Socket (object) - Exposes the socket object



### Event: data

Fires when Pd sends messages with [netsend]. 

```js
pd.on('data', function(data){ });
```

#### Arguments:

1. Data - the actual message



### Event: print

Fires every message that is logged in the console by Pd or the [print] object. WARNING: event is subject to be renamed to stderr. 

```js
pd.on('print', function(buffer){ });
```

#### Arguments:

1. Buffer - the stderr buffer object



### Event: destroy

Fires after the destroy method is called. 

```js
pd.on('destroy', function(){ });
```




Run tests
---------

	node tests/runner.js

Requires
--------
  - [Pure Data](http://crca.ucsd.edu/~msp/software.html)
  - [Node.js](http://nodejs.org/)
