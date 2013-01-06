var net = require('net'),
	spawn = require('child_process').spawn,
	events = require('events').EventEmitter;


function Port(options){
	if (!(this instanceof Port)) return new Port(options);
	this.setOptions(options);
	this.bound = {
		create: create.bind(this),
		connect: connect.bind(this)
	};
	process.on('exit', this.destroy);
}


Port.prototype = Object.create(events.prototype);


Port.prototype.setOptions = function(options){
	this.options = {
		host: options.host || 'localhost',
		read: options.read || null, // [connect <port>( -> [netsend]
		write: options.write || null, // [netreceive <port>]
		encoding: options.encoding || null, // 'ascii', 'utf8', 'base64', 'hex'
		max: ('max' in options) ? options.max : 1, // max connections
		pd: ('pd' in options) ? options.pd
			: (('darwin' == process.platform)
				? '/Applications/Pd-0.43-2.app/Contents/Resources/bin/pd'
				: 'pd'),
		flags: options.flags || [] // ['-noprefs', '-stderr', './port.pd']
	};
};

// listen for [netsend]
function listen(){
	var receiver = this.receiver = net.createServer();
	if (!!this.options.max) receiver.maxConnections = this.options.max;
	receiver.listen(this.options.read, this.options.host);
	receiver.on('listening', this.emit.bind(this, 'listening'));
	receiver.on('connection', connection.bind(this));
	receiver.on('error', this.emit.bind(this, 'error'));
}

// start pd process
function create(){
	if (!this.options.pd) return this;
	var child = this.child = spawn(this.options.pd, this.options.flags);
	if (!!this.options.encoding) child.stderr.setEncoding(this.options.encoding);
	child.on('exit', this.emit.bind(this, 'exit'));
	child.stderr.on('data', this.emit.bind(this, 'stderr'));
	return this;
}

// on [netsend] connection
function connection(socket){
	this.socket = socket;
	if (!!this.options.encoding) socket.setEncoding(this.options.encoding);
	socket.on('data', this.emit.bind(this, 'data'));
	this.emit('connection', socket);
}

// connect to [netreceive]
function connect(){
	var sender = this.sender = new net.Socket();
	if (!!this.options.encoding) sender.setEncoding(this.options.encoding);
	sender.on('connect', this.emit.bind(this, 'connect', sender));
	sender.on('error', this.emit.bind(this, 'error'));
	this.sender.connect(this.options.write, this.options.host);
}

Port.prototype.create = function(){
	if (!!this.options.write) this.on('connection', this.bound.connect);
	if (!this.options.read) return this.bound.create();
	this.on('listening', this.bound.create);
	listen.call(this);
	return this;
};

Port.prototype.destroy = function(){
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

Port.prototype.write = function(data){
	if (data == null) return this;
	this.sender.write(data);
	return this;
};

/*
Port.prototype.getPID = function(){
	return this.child.pid;
};
*/


module.exports = Port;
