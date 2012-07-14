var net = require('net'),
	spawn = require('child_process').spawn,
	io = require('socket.io-client');

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
		flags: ['-path', '../blib/', '-noprefs', './base.pd'],

		host: 'localhost',
		read: 8003, // [netsend]
		write: 8004, // [netreceive]
		encoding: 'ascii', // 'utf8', 'base64'

		onReader: function(){
			this.writer();
		},
		onWriter: function(){
			this.connect();
		},

		onStderr: function(chunk){ // logs data from [print] in '-stderr' mode
			console.log('[print]', chunk.toString().trim());
		},
		onData: function(buffer){ // receive from [netsend]
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

	status: function(prop){
		return prop ? this[prop] : this;
	},

	// planet
	state: {},
	connect: function(location){
		var client = this.client = io.connect(this.options.location, this.options.client);
		client.on('initial state', this.put.bind(this));
		client.on('put', this.put.bind(this));
		client.on('post', this.post.bind(this));
	},
	disconnect: function(){},


	// pd
	create: function(){
		var pd = this.pd = spawn((process.platform == 'darwin')
			? '/Applications/Pd-0.43-2.app/Contents/Resources/bin/pd'
			: 'pd'
			, this.options.flags);
		
		pd.stderr.on('data', this.options.onStderr);
		process.on('exit', this.destroy.bind(this));
	},
	destroy: function(){
		this.pd.kill();
	},


	// connect to [netreceive]
	writer: function(port, host){
		var socket = this.socket = new net.Socket();
		socket.connect(this.options.write, this.options.host);
		socket.setEncoding(this.options.encoding);
		socket.on('connect', this.options.onWriter.bind(this));
	},


	// listen for [netsend]
	listen: function(port, host){
		var server = this.server = net.createServer();
		server.listen(this.options.read, this.options.host);
		server.on('error', this.options.onError);
		server.on('connection', this.reader.bind(this));
	},
	//ignore: function(){},
	reader: function(socket){
		socket.setEncoding(this.options.encoding);
		socket.on('data', this.options.onData);
		socket.on('close', this.options.onClose);
		this.options.onReader.call(this);
	},


	// encode FUDI https://tinker.io/84b96/2
	toFUDI: function(o, pre){
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

	fromFUDI: function(){},

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
