// run `node server.js` and browse to http://localhost:8118/
// this example requires socket.io `npm install socket.io`

var path = require('path'),
	http = require('http'),
	fs = require('fs'),
	socketio = require('socket.io'),
	station = require('../../station');

var dir = path.dirname(path.relative(process.cwd(), process.argv[1]));

var last = require('os').networkInterfaces().en1.length;
console.log('\nbrowse to http://' + require('os').networkInterfaces().en1[last - 1].address + ':8118');



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


// station setup
var pd = station({
	read: 8125, // [netsend]
	write: 8126, // [netreceive]
	flags: ['-noprefs', // '-stderr', '-nogui',
	'-open', dir + '/wavetable.pd']
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

