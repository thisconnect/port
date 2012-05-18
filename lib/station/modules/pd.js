var net = require('net'),
	spawn = require('child_process').spawn;

exports.Wrapper = {

	// spawn a child process

	start: function(bin, args){
		return spawn(bin, args);
	},


	// listening server to receive data from [netsend]

	listen: function(port, host){
		var server = net.createServer();
		server.listen(port || 8001, host || 'localhost');
		server.on('connection', function(socket){
			socket.setEncoding('ascii'); // 'utf8', 'base64'
		});
		return server;
	},


	// sending socket to send data to [netreceive]

	connect: function(port, host){
		var socket = new net.Socket();
		socket.connect(port || 8002, host || 'localhost');
		socket.setEncoding('ascii'); // 'utf8', 'base64'
		return socket;
	}

};
