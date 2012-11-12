var net = require('net'),
	spawn = require('child_process').spawn,
	events = require('events').EventEmitter;


function Station(options){
	if (!(this instanceof Station)) return new Station(options);
	this.setOptions(options);
}


Station.prototype = Object.create(events.prototype);


Station.prototype.setOptions = function(options){
	this.options = {
		host: options.host || 'localhost',
		read: options.read || 8005, // [netsend]
		write: options.write || 8006, // [netreceive]
		pd: options.pd 
			|| (('darwin' == process.platform)
				? '/Applications/Pd-0.43-2.app/Contents/Resources/bin/pd'
				: 'pd'),
		flags: options.flags || ['-noprefs', '-stderr', './station.pd'], // '-path', '../blib/', 
		encoding: options.encoding || 'ascii' // 'utf8', 'base64'
	};
};

// when [netsend] connects
function reader(socket){
	socket.setEncoding(this.options.encoding);
	socket.on('data', this.emit.bind(this, 'data'));
	socket.on('close', this.emit.bind(this, 'close'));
	writer.call(this);
	//o.onReader.apply(this, [socket]);
	this.emit('reader', socket);
}

// connect to [netreceive]
function writer(){
	this.socket = new net.Socket();
	this.socket.connect(this.options.write, this.options.host);
	this.socket.setEncoding(this.options.encoding);
	this.socket.on('connect', this.emit.bind(this, 'writer', this.socket));
}

Station.prototype.create = function(){
	// listens to [netsend]
	this.server = net.createServer();
	this.server.listen(this.options.read, this.options.host);
	this.server.on('error', this.emit.bind(this, 'error'));
	this.server.on('connection', reader.bind(this));
	//this.server.on('listening', function(){});

	// create child process
	this.pd = spawn(this.options.pd, this.options.flags)
	this.pd.stderr.on('data', this.emit.bind(this, 'print'));
	this.pd.on('exit', this.emit.bind(this, 'exit'));
	//process.on('exit', this.destroy.bind(this));

	return this;
};

Station.prototype.destroy = function(){
	if (!!this.socket) this.socket.destroy();
	if (!!this.server) this.server.close();
	delete this.server;
	if (!!this.pd) this.pd.kill();

	return this;
};

Station.prototype.write = function(data){
	this.socket.write(data);
};


module.exports = Station;


