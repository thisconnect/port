var net = require('net'),
	spawn = require('child_process').spawn;

function station(options){
	if (options){
		for (var key in options){
			this.options[key] = options[key];
		}
	}
	if (this.options.onInit) this.options.onInit.call(this);
	return this;
}

station.prototype = {

	options: {
		onInit: function(){
			this.create();
		},
		onReady: function(){},

		// pd
		pd: ('darwin' == process.platform)
			? '/Applications/Pd-0.43-2.app/Contents/Resources/bin/pd'
			: 'pd',

		flags: ['-path', '../blib/', '-noprefs', './base.pd'], // '-stderr'

		encoding: 'ascii', // 'utf8', 'base64'
		host: 'localhost',
		read: 8003, // [netsend]
		write: 8004, // [netreceive]

		onReader: function(socket){},
		onWriter: function(socket){},

		onStderr: function(chunk){ // [print] only in '-stderr' mode
			console.log('[print]', chunk.toString().trim());
		},
		onData: function(buffer){ // [netsend]
			console.log('[netsend]', buffer.trim());
		},
		onClose: function(had_error){
			console.log('pd closed!!!');
		},
		
		onError: function(error){}

	},


	pd: null,
	create: function(){
		this.listen();
		var pd = this.pd = spawn(this.options.pd, this.options.flags);
		pd.stderr.on('data', this.options.onStderr.bind(this));
		process.on('exit', this.destroy.bind(this));
	},
	destroy: function(){
		if (this.server && 0 < this.server.connections) this.server.close();
		if (this.socket) this.socket.destroy();
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
			options.onReady.call(this);
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
	},
	//ignore: function(){},
	reader: function(socket){
		socket.setEncoding(this.options.encoding);
		socket.on('data', this.options.onData);
		socket.on('close', this.options.onClose);
		this.writer();
		this.options.onReader(socket);
	}



};

module.exports = station;
