// run `node server.js` and browse to http://localhost:8118/
// this example requires socket.io `npm install socket.io`

var path = require('path'),
	http = require('http'),
	fs = require('fs'),
	socketio = require('socket.io'),
	station = require('../../station');

//console.log('ip', require('os').networkInterfaces().en1[1].address);

var dir = path.dirname(path.relative(process.cwd(), process.argv[1]));



// http server
var server = http.createServer(function(req, res){
	if (req.url == '/'){
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end([
			'<!doctype html>',
			'<meta charset="utf-8">',
			'<title>Example with Station</title>',
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

console.log('Server running at http://127.0.0.1:8118/');



// create the station

var pd = station({
	read: 8125, // [netsend]
	write: 8126, // [netreceive]
	flags: ['-noprefs', // '-stderr', '-nogui',
	'-open', dir + '/wavetable.pd']
})
.on('print', function(buffer){
	//console.log('print', buffer.toString());
})
.create();



// create a socket.io instance to receive data from the client

var io = socketio.listen(server, {
	'transports': ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'],
	'log level': 1,
	'browser client minification': true,
	'browser client gzip': true
});

io.on('connection', function(socket){
	//console.log('socket.io client connection');

	socket.on('data', function(x, y){
		//console.log('position', x, y);
		pd.write([x, y].join(' ') + ';\n');
	});
});








