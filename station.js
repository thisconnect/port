var net = require('net'),
	spawn = require('child_process').spawn,
	events = require('events').EventEmitter;


function Station(options){
	if (!(this instanceof Station)) return new Station(options);
	this.setOptions(options);
	this.bound = {
		connect: connect.bind(this),
		create: create.bind(this),
		destroy: this.destroy.bind(this),
		listening: this.emit.bind(this, 'listening'),
		connection: connection.bind(this),
		error: this.emit.bind(this, 'error')
		
	};
	process.on('exit', this.bound.destroy);
//	process.on('exit', this.destroy.bind(this));
}


Station.prototype = Object.create(events.prototype);

Station.prototype.setOptions = function(options){
	this.options = {
		host: options.host || 'localhost',
		read: options.read || null, // [netsend]
		write: options.write || null, // [netreceive]
		pd: options.pd 
			|| (('darwin' == process.platform)
				? '/Applications/Pd-0.43-2.app/Contents/Resources/bin/pd'
				: 'pd'),
		// see command line arguments for pd
		// http://crca.ucsd.edu/~msp/Pd_documentation/x3.htm#s4
		flags: options.flags || ['-noprefs', '-stderr', './station.pd'],
		encoding: options.encoding || 'ascii' // 'utf8', 'base64'
	};
};

// listen for [netsend]
function listen(){
	var receiver = this.receiver = this.receiver || net.createServer();
	// receiver.maxConnections = 1;
	receiver.listen(this.options.read, this.options.host);
	receiver.on('listening', this.bound.listening);
	receiver.on('connection', this.bound.connection);
	receiver.on('error', this.bound.error);

//	receiver.on('listening', this.emit.bind(this, 'listening'));
//	receiver.on('connection', connection.bind(this));
//	receiver.on('close', this.emit.bind(this, 'close'));
//	receiver.on('error', this.emit.bind(this, 'error'));
}

// start pd process
function create(){
	var child = this.child = spawn(this.options.pd, this.options.flags);
	child.on('exit', this.emit.bind(this, 'exit'));
	// child.stderr.setEncoding(this.options.encoding); // would transform to string
	child.stderr.on('data', this.emit.bind(this, 'print'));
	return this;
}

// on [netsend] connection
function connection(socket){
	this.socket = socket;
	socket.setEncoding(this.options.encoding);
	socket.on('data', this.emit.bind(this, 'data'));
	//socket.on('close', this.emit.bind(this, 'close'));
	this.emit('connection', socket);
}

// connect to [netreceive]
function connect(){
	var sender = this.sender = new net.Socket();
	sender.setEncoding(this.options.encoding);
	sender.on('connect', this.emit.bind(this, 'connect', sender));
	sender.on('error', this.emit.bind(this, 'error'));
	//sender.on('close', this.emit.bind(this, 'close'));
	this.sender.connect(this.options.write, this.options.host);
}

Station.prototype.create = function(){
	if (!this.options.read) return create.call(this);
	listen.call(this);
	this.on('listening', this.bound.create);
	//this.on('listening', create.bind(this));
	if (!!this.options.write) this.on('connection', this.bound.connect);
	return this;
};

Station.prototype.destroy = function(){
	this.removeListener('listening', this.bound.create);
	this.removeListener('connection', this.bound.connect);
	if (!!this.sender){
		this.sender.destroy();
		this.sender.removeAllListeners();
	}
	delete this.sender;
	if (!!this.receiver){
		//console.log('this.receiver.connections', this.receiver.connections);
		if (!!this.receiver.connections) this.receiver.close();
		this.receiver.removeAllListeners();
	}
	if (!!this.socket) this.socket.destroy();

	delete this.receiver;
	if (!!this.child) this.child.kill();
	process.removeListener('exit', this.bound.destroy);
	this.emit('destroy');
	return this;
};

Station.prototype.write = function(data){
	this.sender.write(data);
	return this;
};

/*
Station.prototype.getPID = function(){
	return this.child.pid;
};
*/


module.exports = Station;
