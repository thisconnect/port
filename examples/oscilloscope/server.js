var station = require('../../station'),
	io = require('socket.io'),
	path = require('path');

var dir = path.dirname(path.relative(process.cwd(), process.argv[1]));

station({
	read: 8115, // [netsend]
	write: 8116, // [netreceive]
	flags: ['-noprefs', '-stderr', '-nogui',
	'-open', dir + '/audioin.pd']
})
.on('connect', function(){
	this.write('dump 64;\n');
})
.on('print', function(buffer){
	console.log('print', buffer.toString());
})
.on('data', function(data){
	console.log('data', data.split(' ').length);
	
	// request the next block
	this.write('dump 64;\n');
})
.create();

