var port = require('port');

port({
	read: 8005,
	write: 8006,
	encode: 'ascii',
	flags: ['-noprefs', '-send', 'pd dsp 1, dsp 0', './port.pd']
})
.on('connect', function(){
	console.log('on connect');
	this.write('a message to pd;\n');
})
.on('data', function(buffer){
	console.log('on data', buffer.toString());
})
.create();
