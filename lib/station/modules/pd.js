var net = require('net'),
	spawn = require('child_process').spawn;

exports.Wrapper = {

	// spawn a child process

	start: function(bin, args){
		return spawn(bin, args);
	},


	// listening for [netsend] connection

	listen: function(port, host){
		var server = net.createServer();
		server.listen(port || 8001, host || 'localhost');
		server.on('connection', function(socket){
			socket.setEncoding('ascii'); // 'utf8', 'base64'
		});
		return server;
	},


	// connect to [netreceive]

	connect: function(port, host){
		var socket = new net.Socket();
		socket.connect(port || 8002, host || 'localhost');
		socket.setEncoding('ascii'); // 'utf8', 'base64'
		return socket;
	},


	// encode FUDI
	// https://tinker.io/84b96/2

	toFUDI: function(o, pre){
		var paket = [];
		if (pre == null) pre = '';
		for (var p in o) {
			if (o[p] != null){ 
				if (Array.isArray(o[p])){
					paket.push(pre + p + ' ' + o[p].join(' '));
				} else if (typeof o[p] == 'object'){
					paket.push(this.toFUDI(o[p], pre + p + ' '));
				} else {
					paket.push(pre + p + ' ' + o[p]);
				}
			}
		}
		if (pre == '') paket.push('');
		return paket.join(';\n');
	}

};
