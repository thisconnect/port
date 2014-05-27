var port = require('../port');

port({
	'read': 8205, // [netsend]
	'write': 8206, // [netreceive]
	'encoding': 'ascii',
	'basepath': __dirname,
	'flags': {
		'noprefs': true,
		'stderr': true,
		'nogui': true,
		'open': 'io-print.pd'
	}
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

