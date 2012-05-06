(function(){

var io = require('socket.io-client');

var Client = exports.Client = {

	connect: function(){
		var socket = this.$socket = io.connect('ws://localhost:8999'/*, {
			'reconnect': true,
			'reconnection delay': 500,
			'max reconnection attempts': 10
		}*/);
		
		socket.on('connecting', this.onConnecting.bind(this));
		socket.on('connect', this.onConnect.bind(this));
		socket.on('connect_failed', this.onFailed.bind(this));
		socket.on('state update', this.update.bind(this));
	},
	
	onConnecting: function(transport){},
	
	onConnect: function(){},
	
	onFailed: function(){},
	
	update: function(data){
		//this.parse(data.value);
		this.onReceive(data.key, data.value);
	},
	
	onReady: function(){},
	
	/* send: function(data){
		this.$socket.emit('update', {
			key: 'foo',
			value: 123
		});
	}, */
	
	parse: function(values){
		for (var key in values){
			// if (data.payload.hasOwnProperty(i))
			// console.log(i.replace(/\:/, ' '), payload[i]);
			this.onReceive(key, values[key]);
		}
	},
	
	onReceive: function(key, value){}
	
};

})();
