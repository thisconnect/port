(function(){

var io = require('socket.io-client');

// io.enable('browser client minification');
// io.enable('browser client etag');
// io.enable('browser client gzip');
// io.set('log level', 1);
// io.set('transports', ['websocket']);

var Client = exports.Client = {

	connect: function(){
		var socket = this.$socket = io.connect('ws://localhost:8999', {
			'reconnect': true,
			'reconnection delay': 500,
			'max reconnection attempts': 10
		});
		
		socket.addListener('connecting', this.onConnecting.bind(this));
		socket.addListener('connect', this.onConnect.bind(this));
		socket.addListener('connect_failed', this.onFailed.bind(this));
		socket.addListener('message', this.transmission.bind(this));
	},
	
	onConnecting: function(transport){},
	
	onConnect: function(){},
	
	onFailed: function(){},
	
	transmission: function(data){
		data = JSON.parse(data);
		if (!data.type) return null;
		if (data.type == 'initial_state'){
			this.onReady();
			this.parse(data.payload);
		}
		if (data.type == 'state_update') this.parse(data.payload);
	},
	
	onReady: function(){},
	
	/* send: function(data){
		this.$socket.send(JSON.stringify({
			type: 'attempt_update',
			payload: {
				component: 'foo',
				payload: 123
			}
		}));
	}, */
	
	parse: function(payload){
		for (var i in payload){
			// if (data.payload.hasOwnProperty(i))
			// console.log(i.replace(/\:/, ' '), payload[i]);
			this.onReceive(i, payload[i])
		}
	},
	
	onReceive: function(component, payload){}
	
};

})();
