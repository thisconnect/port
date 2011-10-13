(function(){

var io = require('socket.io-client');

var Client = exports.Client = {

	connect: function(){
		var socket = this.$socket = io.connect('ws://localhost:8999');
		socket.addListener('connecting', this.onConnecting.bind(this));
		socket.addListener('connect_failed', this.onFailed.bind(this));
		socket.addListener('message', this.onMessage.bind(this));
	},
	
	onConnecting: function(transport){
		console.log('connecting', transport);
	},
	
	onFailed: function(){
		console.log('connect_failed');
	},
	
	onMessage: function(data){
		data = JSON.parse(data);
		if (!data.type) return null;
		if (data.type == 'initial_state') this.parse(data.payload);
		if (data.type == 'state_update') this.parse(data.payload);
	},
	
	parse: function(payload){
		//console.log(payload);
		for (var i in payload){
			// if (data.payload.hasOwnProperty(i)) 
			console.log(i.replace(/\:/, ' '), payload[i]);
		}
	}
	
};



/*
socket.addListener('connecting', function(transport){
	console.log('connecting', transport);
});

	socket.addListener('connect', function(){
		console.log('connect');
	});

	socket.addListener('connect_failed', function(){ 
		console.log('connect_failed');
	});
	

socket.addListener('message', function(data){
	console.log('data', data);
	data = JSON.parse(data);
	
	if (!data.type) return null;
	
	if (data.type == 'state_update'){
		
		for (var i in data.payload){
			// if (data.payload.hasOwnProperty(i)) 
			console.log(i.replace(/\:/, ' '), data.payload[i]);
		}
		
	}
	
	if (data.type == 'initial_state'){
		
		
		for (var i in data.payload){
			// if (data.payload.hasOwnProperty(i)) 
			console.log(i.replace(/\:/, ' '), data.payload[i]);
		}
	
	}
	
});
*/

/*
	socket.send(JSON.stringify({
		type: 'attempt_update',
		payload: {
			component: 'foo',
			payload: 123
		}
	}));
*/

})();

