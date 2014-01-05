var net = require('net'),
	spawn = require('child_process').spawn,
	event = require('events').EventEmitter;


function Port(options){
	if (!(this instanceof Port)) return new Port(options);
	this.setOptions(options);
	process.on('exit', this.destroy);
}


Port.prototype = Object.create(event.prototype);


Port.prototype.setOptions = function(options){
	this.options = {
		host: options.host || 'localhost',
		read: options.read || null, // [connect <port>( -> [netsend]
		write: options.write || null, // [netreceive <port>]
		encoding: options.encoding || null, // 'ascii', 'utf8', 'base64', 'hex'
		max: ('max' in options) ? options.max : 1, // max connections
		pd: ('pd' in options) ? options.pd
			: (('darwin' == process.platform)
				? '/Applications/Pd-0.45-4-64bit.app/Contents/Resources/bin/pd'
				: 'pd'),
		flags: options.flags || [] // ['-noprefs', '-stderr', './port.pd']
	};
};

function parseFlags(flags){
	var array = [];
	if (Array.isArray(flags)) return flags;
	for (var f in flags){
		if (/path|open/.test(f) || !flags[f]) continue;
		array.push(f);
		if (typeof flags[f] != 'boolean') array.push(o[f]);
	}
	if (!Array.isArray(flags['-path'])) array.push('-path', flags['-path']);
	else for (var i = 0, l = flags['-path'].length; i < l; ++i){
		array.push('-path', flags['-path'][i]);
	}
	array.push('-open', flags['-open']);
	return array;
}

// start pd process
Port.prototype.spawn = function(){
	if (!this.options.pd) return this;
	var child = this.child = spawn(this.options.pd, parseFlags(this.options.flags));
	if (!!this.options.encoding) child.stderr.setEncoding(this.options.encoding);
	child.on('exit', this.emit.bind(this, 'exit'));
	child.stderr.on('data', this.emit.bind(this, 'stderr'));
	return this;
};

// on [netsend] connection
function connection(socket){
	this.socket = socket;
	if (!!this.options.encoding) socket.setEncoding(this.options.encoding);
	socket.on('data', this.emit.bind(this, 'data'));
	this.emit('connection', socket);
}

// listen for [netsend]
Port.prototype.listen = function(){
	var receiver = this.receiver = net.createServer();
	if (!!this.options.max) receiver.maxConnections = this.options.max;
	receiver.listen(this.options.read, this.options.host);
	receiver.on('listening', this.emit.bind(this, 'listening'));
	receiver.on('connection', connection.bind(this));
	receiver.on('error', this.emit.bind(this, 'error'));
};

// connect to [netreceive]
Port.prototype.connect = function(){
	var sender = this.sender = new net.Socket();
	if (!!this.options.encoding) sender.setEncoding(this.options.encoding);
	sender.on('connect', this.emit.bind(this, 'connect', sender));
	sender.on('error', this.emit.bind(this, 'error'));
	this.sender.connect(this.options.write, this.options.host);
};

// send data to [netreceive]
Port.prototype.write = function(data){
	if (data != null) this.sender.write(data);
	return this;
};

// start Port
Port.prototype.create = function(){
	if (!!this.options.write) this.on('connection', this.connect);
	if (!this.options.read) return this.spawn();
	this.on('listening', this.spawn);
	this.listen();
	return this;
};

// stop Port
Port.prototype.destroy = function(){
	process.removeListener('exit', this.destroy);
	this.removeAllListeners('listening');
	this.removeAllListeners('connection');
	if (!!this.sender){
		this.sender.destroy();
		this.sender.removeAllListeners('connect');
		this.sender.removeAllListeners('error');
		delete this.sender;
	}
	if (!!this.receiver){
		this.receiver.close();
		this.receiver.removeAllListeners('listening');
		this.receiver.removeAllListeners('connection');
		this.receiver.removeAllListeners('error');
		delete this.receiver;
	}
	if (!!this.socket) this.socket.destroy();

	if (!!this.child){
		this.child.stderr.removeAllListeners('data');
		this.child.kill();
	}
	this.emit('destroy');
	return this;
};


module.exports = Port;
