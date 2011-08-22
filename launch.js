var net = require('net');

// http://nodejs.org/docs/v0.5.2/api/net.html

var server = net.createServer(function(socket){
	socket.end('goodbye\n');
});

// http://nodejs.org/docs/v0.5.2/api/streams.html#readable_Stream

server.listen(4542, 'localhost', function(){
	var address = server.address();
	//console.log('opened server on %j', address);
	
	console.log('please open base.pd manually');
});

server.on('connection', function(socket){

	console.log('connection');
	
	/*var pdsocket = new net.Socket();
	pdsocket.connect('4541', 'localhost', function(){
		console.log('pdsocket');
	});*/
	
	var pdsocket = net.createConnection(4541, 'localhost');
	
	pdsocket.on('connect', function(){
		//console.log('pdsocket connect');
		pdsocket.write('lalallaal lalalal;\n');
	});
	
	socket.setEncoding('ascii'); // 'utf8', 'base64'
	
	socket.on('connect', function(){
		console.log('connect');
	});
	
	socket.on('data', function(buffer){
		console.log('data', buffer);
	});
	
	socket.on('close', function(){
		console.log('close');
	});
	
});

server.on('error', function(e){
	console.log('error');
});
