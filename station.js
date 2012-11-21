var net = require('net'),
	spawn = require('child_process').spawn,
	events = require('events').EventEmitter;


function Station(options){
	if (!(this instanceof Station)) return new Station(options);
	this.setOptions(options);
	this.bound = {
		create: create.bind(this),
		connect: connect.bind(this)
	};
	process.on('exit', this.destroy);
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
		flags: options.flags || ['-noprefs', '-stderr', './station.pd'],
		encoding: options.encoding || 'ascii' // 'utf8', 'base64', 'hex'
	};
};

// listen for [netsend]
function listen(){
	var receiver = this.receiver = net.createServer();
	// receiver.maxConnections = 1;
	receiver.listen(this.options.read, this.options.host);
	receiver.on('listening', this.emit.bind(this, 'listening'));
	receiver.on('connection', connection.bind(this));
	receiver.on('error', this.emit.bind(this, 'error'));
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
	this.emit('connection', socket);
}

// connect to [netreceive]
function connect(){
	var sender = this.sender = new net.Socket();
	sender.setEncoding(this.options.encoding);
	sender.on('connect', this.emit.bind(this, 'connect', sender));
	sender.on('error', this.emit.bind(this, 'error'));
	this.sender.connect(this.options.write, this.options.host);
}

Station.prototype.create = function(){
	if (!!this.options.write) this.on('connection', this.bound.connect);
	if (!this.options.read) return create.call(this);
	this.on('listening', this.bound.create);
	listen.call(this);
	return this;
};

Station.prototype.destroy = function(){
	process.removeListener('exit', this.destroy);
	this.removeListener('listening', this.bound.create);
	this.removeListener('connection', this.bound.connect);
	if (!!this.sender){
		this.sender.destroy();
		this.sender.removeAllListeners();
		delete this.sender;
	}
	if (!!this.receiver){
		if (!!this.receiver.connections) this.receiver.close();
		this.receiver.removeAllListeners();
		delete this.receiver;
	}
	if (!!this.socket) this.socket.destroy();

	if (!!this.child) this.child.kill();
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
