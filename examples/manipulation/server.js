// run `node server.js` and browse to http://localhost:8118/
// this example requires socket.io `npm install socket.io`

var path = require('path'),
	http = require('http'),
	fs = require('fs'),
	socketio = require('socket.io'),
	port = require('../../port');

var dir = path.dirname(path.relative(process.cwd(), process.argv[1]));

var interface = require('os').networkInterfaces();

Object.keys(interface).forEach(function(network){
	var external = interface[network].filter(function(i){
		return (!i.internal && i.family == 'IPv4');
	});
	if (!!external[0]) interface = external[0].address;
});

console.log('\nbrowse to http://' + interface + ':8118');



// http server
var server = http.createServer(function(req, res){
	if (req.url == '/'){
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end([
			'<!doctype html>',
			'<meta charset="utf-8">',
			'<title>Port</title>',
			'<style>body { margin: 0; }</style>',
			'<canvas id=osci width=640 height=480></canvas>',
			'<script src="/socket.io/socket.io.js"></script>',
			'<script src="/client.js"></script>\n'
		].join('\n'));

	} else if (req.url.match(/^\/client\.js$/)){
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
}).listen(8118);


// port setup
var pd = port({
	'read': 8125, // [netsend]
	'write': 8126, // [netreceive]
	'flags': {
		'noprefs': true, // '-stderr', '-nogui',
		'open': dir + '/wavetable.pd'
	}
})
.on('stderr', function(buffer){
	console.log(buffer.toString());
})
.create();


// use socket.io to receive data from clients
var io = socketio.listen(server, {
	'transports': ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'],
	'log level': 1,
	'browser client minification': true,
	'browser client gzip': true
});

io.on('connection', function(socket){
	socket.on('data', function(x, y){
		//console.log('position', x, y);
		
		// x, y to FUDI
		pd.write([x, y].join(' ') + ';\n');
	});
});

