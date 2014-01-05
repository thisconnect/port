var port = require('../port'),
	path = require('path');

var dir = path.dirname(path.relative(process.cwd(), process.argv[1]));

port({
	read: 8205, // [netsend]
	write: 8206, // [netreceive]
	encoding: 'ascii',
	flags: ['-noprefs', '-nogui', dir + '/io-netsend.pd']
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

