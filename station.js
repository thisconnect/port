var io = require('socket.io-client'),
	net = require('net'),
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
			this.listen();
			this.create();
		},

		// pd
		pd: (process.platform == 'darwin')
			? '/Applications/Pd-0.43-2.app/Contents/Resources/bin/pd'
			: 'pd',

		flags: ['-path', '../blib/', '-noprefs', './base.pd'],

		host: 'localhost',
		read: 8003, // [netsend]
		write: 8004, // [netreceive]
		encoding: 'ascii', // 'utf8', 'base64'

		onReader: function(socket){},
		onWriter: function(socket){
			this.connect();
		},

		onStderr: function(chunk){ // [print] only in '-stderr' mode
			console.log('[print]', chunk.toString().trim());
		},
		onData: function(buffer){ // [netsend]
			console.log('[netsend]', buffer.trim());
		},
		onClose: function(had_error){
			console.log('pd closed!!!');
		},

		// planet
		location: '//:8006',
		client: {
			'force new connection': 1//,
			//'reconnect': true,
			//'reconnection delay': 500,
			//'max reconnection attempts': 10
		},

		onConnection: function(socket){},
		onError: function(error){}
	},


	pd: null,
	create: function(){ // spawn pd process
		var pd = this.pd = spawn(this.options.pd, this.options.flags);
		pd.stderr.on('data', this.options.onStderr.bind(this));
		process.on('exit', this.destroy.bind(this));
	},
	destroy: function(){
		if (this.server) this.server.close();
		if (this.socket) this.socket.destroy();
		this.pd.kill();
	},


	socket: null,
	writer: function(port, host){ // connect to [netreceive]
		var that = this, options = this.options, 
			socket = this.socket = new net.Socket();

		socket.connect(options.write, options.host);
		socket.setEncoding(options.encoding);
		socket.on('connect', function(){
			options.onWriter.apply(that, [socket]);
		});
	},


	server: null,
	listen: function(port, host){ // listen for [netsend]
		var options = this.options,
			server = this.server = net.createServer();

		server.listen(options .read, options .host);
		server.on('error', options .onError);
		server.on('connection', this.reader.bind(this));
	},
	//ignore: function(){},
	reader: function(socket){
		socket.setEncoding(this.options.encoding);
		socket.on('data', this.options.onData);
		socket.on('close', this.options.onClose);
		this.writer();
		this.options.onReader(socket);
	},

	toFUDI: function(o, pre){ // encode FUDI https://tinker.io/84b96/2
		var paket = [], message = '';
		if (pre == null) pre = '';
		for (var p in o) {
			if (o[p] != null){ 
				if (Array.isArray(o[p])){
					message = pre + p + ' ' + o[p].join(' ');

				} else if (typeof o[p] == 'object'){
					message = this.toFUDI(o[p], pre + p + ' ');

				} else {
					message = pre + p + ' ' + o[p];
				}
				paket.push(message);
			}
		}
		if (pre == '') paket.push('');
		return paket.join(';\n');
	},

	//fromFUDI: function(){},


	// planet
	client: null,
	connect: function(location){
		var client = this.client = io.connect(this.options.location, this.options.client);
		client.on('initial state', this.put.bind(this));
		client.on('put', this.put.bind(this));
		client.on('post', this.post.bind(this));
	},
	disconnect: function(){},

	state: {},
	put: function(data){
		var components = '', values = '';

		for (var pos in data){
			for (var component in data[pos]){
				if (this.state[pos] != component){
					components += 'set ' + pos + ' ' + component + ';\n';
					
					values += this.toFUDI(data[pos][component], 'list space.' + pos + ' ');
					this.state[pos] = component;
				}
			}
		}
		this.socket.write(components + values + ';\n');
		//console.log('CREATE', components + values + ';\n');
	},

	post: function(data){
		var path = data.path, value = data.value;

		if (data.key != null){
			path = data.key.split('.');
		}
/*		if (data.key == null){
			key = (typeof path == 'string') 
				? path.replace(/\./g, ' ')
				: path.join(' ');
		}
*/		if (Array.isArray(value)) value = value.join(' ');
		var message = ['list', 'space.' + path[0], path[2], value];
		this.socket.write(message.join(' ') + ';\n');
		//console.log('UPDATE', message + ';\n');
	}

};

module.exports = station;
