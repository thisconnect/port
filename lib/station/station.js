var planet = require('./modules/planet.js').Client,
	pd = require('./modules/pd.js').Connection;

// planet
planet.onReady = function(){
	console.log('planet connection up');
};

planet.onReceive = function(key, value){
	// console.log(key.replace(/\:/, ' '), value);
	pd.send(key.replace(/\:/, ' ') + ' ' + value + ';\n');
};

planet.connect();

// pd
pd.onConnected = function(){
	console.log('outgoing connection ready');
	pd.send('hi pd;\n');
	
	planet.onReceive = function(component, payload){
		// console.log(component.replace(/\:/, ' '), payload);
		pd.send(component.replace(/\:/, ' ') + ' ' + payload + ';\n');
	};
};

pd.onClose = function(){
	console.log('pd quit!');
};

pd.onListening = function(){
	console.log('incomming connection ready');
	pd.connect();
};

pd.onReceive = function(buffer){
	console.log('data coming from pd:', buffer);
};

pd.listen();
