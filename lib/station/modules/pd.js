(function(){
var net = require('net'),
	spawn = require('child_process').spawn;

exports.Connection = {

	onStdout: function(data){},
	onStderr: function(data){},
	onExit: function(code){},

	open: function(bin, args){
		var process = spawn(bin, args);
		process.stdout.on('data', this.onStdout);
		process.stderr.on('data', this.onStderr);
		process.on('exit', this.onExit);
	},

	onListening: function(socket){},
	onReceive: function(buffer){},
	//onEnd: function(){},

	listen: function(){
		var that = this,
			server = this.listener = net.createServer();

		server.listen(4542, 'localhost', function(){
			// var address = server.address();
		});

		server.on('connection', function(socket){
			//that.listener = socket;
			socket.setEncoding('ascii'); // 'utf8', 'base64'
			socket.on('data', that.onReceive);
			that.onListening(socket);
		});
	},

	onConnected: function(){},
	onSend: function(){},
	onError: function(error){},
	onClose: function(){},

	connect: function(){
		var socket = this.sender = new net.Socket();

		socket.on('error', this.onError);
		socket.connect('4541', 'localhost', this.onConnected);
		//socket.on('connect', this.onConnected);
		socket.setEncoding('ascii'); // 'utf8', 'base64'
		socket.on('close', this.onClose);
	},

	send: function(data){
		this.sender.write(data, this.onSend);
		return this;
	}

};

})();
