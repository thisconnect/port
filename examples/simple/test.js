var port = require('port');

port({
	'read': 8005,
	'write': 8006,
	'encoding': 'ascii',
	'basepath': __dirname,
	'flags': {
		'noprefs': true,
		'stderr': true,
		'send': 'pd dsp 1, dsp 0',
		'open': './port.pd'
	}
})
.on('connect', function(){
	console.log('on connect');
	this.write('a message to pd;\n');
})
.on('stderr', function(buffer){
	console.log('on stderr');
	console.log(buffer.toString());
})
.create();
