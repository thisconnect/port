(function(){

var net = require('net');

var Connection = exports.Connection = {

	listen: function(){
		
		var that = this,
			server = this.listener = net.createServer();
		// http://nodejs.org/docs/v0.5.2/api/net.html
		
		server.listen(4542, 'localhost', function(){
			// http://nodejs.org/docs/v0.5.2/api/streams.html#readable_Stream
			// var address = server.address();
		});
		
		server.on('connection', function(socket){
			that.listener = socket;
			
			socket.setEncoding('ascii'); // 'utf8', 'base64'
			
			socket.on('data', that.onReceive);
			
			that.onListening(socket);
		});
	},
	
	onListening: function(socket){},
	
	onReceive: function(buffer){},
	
	onEnd: function(){},
	
	connect: function(){
		
		var that = this,
			socket = this.sender = new net.Socket();
		
		socket.on('error', this.onError);
		
		socket.connect('4541', 'localhost', this.onConnected);
		//socket.on('connect', function(){});
		
		socket.setEncoding('ascii'); // 'utf8', 'base64'
		
		socket.on('close', this.onClose);
	},
	
	send: function(data){
		this.sender.write(data);
	},
	
	onConnected: function(){},
	
	onError: function(error){},
	
	onClose: function(){}

};

})();
