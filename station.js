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
		var pd = this.pd = spawn(this.options.pd, this.options.flags);
		pd.stderr.on('data', this.options.onStderr.bind(this));
		process.on('exit', this.destroy.bind(this));
		return this;
	},
	destroy: function(){
		/*console.log('\nsocket', this.socket);
		console.log('\nserver', this.server);
		console.log('\npd', this.pd);*/
		
	
		if (this.socket) this.socket.destroy();
		if (this.server && 0 < this.server.connections) this.server.close();
		if (this.pd) this.pd.kill();
	},


	socket: null,
	writer: function(port, host){ // connect to [netreceive]
		var that = this,
			options = this.options, 
			socket = this.socket = new net.Socket();

		socket.connect(options.write, options.host);
		socket.setEncoding(options.encoding);
		socket.on('connect', function(){
			options.onWriter.apply(that, [socket]);
			options.onReady.call(that);
		});
	},
	write: function(data){
		this.socket.write(data);
	},


	server: null,
	listen: function(port, host){ // listen for [netsend]
		var options = this.options,
			server = this.server = net.createServer();

		server.listen(options.read, options.host);
		server.on('error', options.onError);
		server.on('connection', this.reader.bind(this));
		return this;
	},
	//ignore: function(){},
	reader: function(socket){
		var bound = { onData: this.options.onData.bind(this) };
		socket.setEncoding(this.options.encoding);
		socket.on('data', bound.onData);
		socket.on('close', this.options.onClose);
		this.writer();
		this.options.onReader.apply(this, [socket]);
	}

};

module.exports = function(options) {

	var that = new Station();

	that.options = {
		onInit: function(){},
		onReady: function(){},
		// pd
		pd: ('darwin' == process.platform)
			? '/Applications/Pd-0.43-2.app/Contents/Resources/bin/pd'
			: 'pd',
		flags: ['-path', '../blib/', '-noprefs', './station.pd'], // '-stderr'
		encoding: 'ascii', // 'utf8', 'base64'
		host: 'localhost',
		read: 8003, // [netsend]
		write: 8004, // [netreceive]
		onReader: function(socket){},
		onWriter: function(socket){},
		onStderr: function(chunk){}, // [print] only in '-stderr' mode
		onData: function(buffer){}, // [netsend]
		onClose: function(had_error){},
		onError: function(error){}
	};

	that.setOptions(options);
	return that;
};



