# Port

A Node.js module to spawn and communicate with Pure Data (aka Pd).



Example
-------

```js
var port = require('port');

port({
	read: 8004,
	write: 8005,
	flags: ['-noprefs', '-send', 'pd dsp 1, dsp 0', './examples/simple/port.pd']
})
.on('connect', function(){
	this.write('Hello Pd!;\n');
})
.on('data', function(data){
	console.log(data);
})
.create();
```



Install
-------

```bash
npm install port
```



API
---

### Constructor: Port

```js
var Port = require('port');

var pd = new Port(options);
```

The `new` keyword is optional.

##### Options

  - `host` - (string) The domain of the Pd process. Defaults to localhost.
  - `read` - (number | null) The port to listen to Pd's [netsend]. 
  Defaults to null.
  - `write` - (number | null) The port to connect to Pd's [netreceive]. 
  Defaults to null.
  - `encoding` - (ascii | utf8 | base64 | hex | null)
  The encoding of the read and write socket, 
  [nodejs.org/api/stream.html#stream_stream_setencoding_encoding](http://nodejs.org/api/stream.html#stream_stream_setencoding_encoding)
  Defaults to null.
  - `max` - (number) Limits amount of incoming connections. Defaults to 1.
  - `pd` - (string) The command or location to spawn the Pd process. 
  Defaults to an absolute path to the Pd binary on OS X.
  Defaults to 'pd' on Linux.
  - `flags` - (array|object) The command line arguments for the Pd process. 
  Expects an array of arguments. Read more about Pd's configuration flags on 
  [crca.ucsd.edu/~msp/Pd_documentation/x3.htm#s4](http://crca.ucsd.edu/~msp/Pd_documentation/x3.htm#s4) . 
  Defaults to [].



Methods
-------


### Method: Port.create

1. Spawns the Pd process.
2. Listens for an incoming socket connection.
3. Connects to on the write port.

Each of the 3 steps are individually executed depending on the configuraion options.

```js
pd.create();
```



### Method: Port.destroy

Kills the Pd process and ends all open connections. 

```js
pd.destroy();
```



### Method: Port.write

Sends a paket containing one or many messages to Pd's [netreceive].

WARNING: write does not check if the write socket is ready and may error!

```js
pd.write('Hello Pd!;\n');
```

##### Arguments

1. Data (string) - the packet to send to the write socket.



Events
------

Port is an event emitter see also
[nodejs.org/api/events.html](http://nodejs.org/api/events.html)



### Event: listening

Fires if the `read` port is specified and after Port.create is called.
At this point Port is waiting for an incoming TCP connection from Pd's [netsend].

```js
pd.on('listening', function(){ });
```



### Event: connection

Fires when Pd connects and the `read` port is specified.

```js
pd.on('connection', function(socket){ });
```

##### Arguments

1. Socket (object) - Exposes the socket connection from [netsend].



### Event: connect

Fires when Port connects to Pd on the write port. 

```js
pd.on('connect', function(socket){ });
```

##### Arguments

1. Socket (object) - Exposes the socket connection to [netreceive].



### Event: data

Fires when Pd sends a message with [netsend]. 

```js
pd.on('data', function(data){ });
```

##### Arguments

1. Data - a buffer object or a string (if encoding is not null).



### Event: stderr

Fires on every message that is written to the console the [print] object 
or anything else. This event is only available with `-stderr` or `-nogui` flag.

```js
pd.on('stderr', function(buffer){ });
```

##### Arguments

1. Buffer - the stderr buffer object.



### Event: destroy

Fires after the destroy method is called. 

```js
pd.on('destroy', function(){ });
```



Tests
-----

```bash
make test
```



Examples
--------

Some examples are only proof of concept and are not optimized for best performance.

```bash
node examples/testing/division.js

node examples/manipulation/server.js
```



Requires
--------

  - Vanilla Pure Data from 
  [crca.ucsd.edu/~msp/software.html](http://crca.ucsd.edu/~msp/software.html)
  or Pd-extended from [puredata.info/downloads](http://puredata.info/downloads).
  - Node.js from [nodejs.org](http://nodejs.org/).
