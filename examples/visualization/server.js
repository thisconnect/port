// run `node server.js` and browse to http://localhost:8118/
// this example requires socket.io `npm install socket.io`

var path = require('path'),
	http = require('http'),
	fs = require('fs'),
	socketio = require('socket.io'),
	port = require('../../port');


var dir = path.dirname(path.relative(process.cwd(), process.argv[1]));


// create a http server to deliver the client side

var server = http.createServer(function(req, res){
	if (req.url == '/'){
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end([
			'<!doctype html>',
			'<meta charset="utf-8">',
			'<title>Oscilloscope with Port</title>',
			'<canvas id=osci width=1024 height=480></canvas>',
			'<script src="/socket.io/socket.io.js"></script>',
			'<script src="/client.js"></script>\n'
		].join('\n'));

	} else if(req.url == '/client.js'){
		res.writeHead(200, {'Content-Type': 'text/javascript'});
		fs.createReadStream(dir + '/client.js')
		.on('data', function(chunk){
			res.write(chunk);
		})
		.on('end', function(){
			res.end();
		});

	} else {
		res.writeHead(404, {'Content-Type': 'text/html'});
		res.end('<h1>Not Found</h1>\n');
	}
}).listen(8118, 'localhost');

console.log('Server running at http://localhost:8118/');

console.log('WARNING', 'this example is not optimized and probably requires a lot CPU power');


// create a socket.io instance to push data to the client

var client;

var io = socketio.listen(server, {
	'transports': ['websocket'],
	'log level': 1,
	'browser client minification': true,
	'browser client gzip': true
});

io.on('connection', function(socket){

	// create the port

	var pd = port({
		read: 8115, // [netsend]
		write: 8116, // [netreceive]
		encoding: 'ascii',
		flags: ['-noprefs', '-nogui', dir + '/audioin.pd']
	})
	.on('connect', function(){
		this.write('run 1;\n');
	})
	.on('data', function(data){
		var i, l;
		data = data.slice(0, -2).split(' ');
		l = data.length;
		for (i = 0; i < l; i += 1){
			data[i] = +data[i];
		}
		if (!!socket) socket.emit('data', data);
	})
	.create();

	socket.on('disconnect', function(){
		pd.destroy();
	});

});

