var net = require('net'),
	spawn = require('child_process').spawn;


function Station(){}

Station.prototype = {

	options: {},

	setOptions: function(options){
		if (!options) return null;
		for (var key in options){
			this.options[key] = options[key];
		}
	},

	pd: null,

	create: function(){
		var o = this.options,
			pd = this.pd = spawn(o.pd, o.flags),
			bound = {
				onStderr: o.onStderr.bind(this),
				destroy: this.destroy.bind(this)
			};

		pd.stderr.on('data', bound.onStderr);
		process.on('exit', bound.destroy);
		return this;
	},

	destroy: function(){
		if (this.socket) this.socket.destroy();
		if (this.server && 0 < this.server.connections) this.server.close();
		if (this.pd) this.pd.kill();
	},

	socket: null,

	writer: function(port, host){ // connect to [netreceive]
		var that = this,
			o = this.options,
			socket = this.socket = new net.Socket();

		socket.connect(o.write, o.host);
		socket.setEncoding(o.encoding);
		socket.on('connect', function(){
			o.onWriter.apply(that, [socket]);
			o.onReady.call(that);
		});
	},

	write: function(data){
		this.socket.write(data);
	},

	server: null,

	listen: function(port, host){ // listen for [netsend]
		var o = this.options,
			server = this.server = net.createServer();

		server.listen(o.read, o.host);
		server.on('error', o.onError);
		server.on('connection', this.reader.bind(this));
		return this;
	},

	//ignore: function(){},

	reader: function(socket){
		var o = this.options,
			bound = {
				onData: o.onData.bind(this),
				onClose: o.onClose.bind(this)
			};

		socket.setEncoding(o.encoding);
		socket.on('data', bound.onData);
		socket.on('close', bound.onClose);
		this.writer();
		o.onReader.apply(this, [socket]);
	}

};

module.exports = function(options) {

	var that = new Station();

	that.options = {
		onReady: function(){},
		pd: ('darwin' == process.platform)
			? '/Applications/Pd-0.43-2.app/Contents/Resources/bin/pd'
			: 'pd',
		flags: ['-path', '../blib/', '-noprefs', './station.pd'], // '-stderr'
		encoding: 'ascii', // 'utf8', 'base64'
		host: 'localhost',
		read: 8003, // [netsend]
		write: 8004, // [netreceive]
		onReader: function(socket){}, // [connect <port>( -> [netsend]
		onData: function(buffer){}, // [send <data>( -> [netsend]
		onWriter: function(socket){},
		onStderr: function(chunk){}, // [print] only in '-stderr' mode
		onClose: function(had_error){},
		onError: function(error){}
	};

	that.setOptions(options);
	return that;
};



