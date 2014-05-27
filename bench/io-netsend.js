var port = require('../port');

port({
	'read': 8205, // [netsend]
	'write': 8206, // [netreceive]
	'encoding': 'ascii',
	'basepath': __dirname,
	'flags': {
		'noprefs': true,
		'nogui': true,
		'open': 'io-netsend.pd'
	}
})
.on('connect', function(){
	this.write('bang;\n');
})
// receive data from [netsend]
.on('data', function(data){
	console.log(data);
	this.write('bang;\n');
})
.create();

