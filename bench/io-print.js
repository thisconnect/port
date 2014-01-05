var port = require('../port'),
	path = require('path');

var dir = path.dirname(path.relative(process.cwd(), process.argv[1]));

port({
	read: 8205, // [netsend]
	write: 8206, // [netreceive]
	encoding: 'ascii',
	flags: ['-noprefs', '-stderr', '-nogui', dir + '/io-print.pd']
})
.on('connect', function(socket){
	// receive data from [print]
	this.on('stderr', function(data){
		socket.write('bang;\n');
		console.log(data);
	});
	this.write('bang;\n');
})
.create();

