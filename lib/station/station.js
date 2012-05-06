(function(){

var planet = require('./modules/planet.js').Client,
	pdtalk = require('./modules/pd.js').Connection;


// planet

planet.onReady = function(){
	console.log('planet connection up');
};

planet.onReceive = function(key, value){
	// console.log(key.replace(/\:/, ' '), value);
	pdtalk.send(key.replace(/\:/, ' ') + ' ' + value + ';\n');
};

planet.connect();


// pd

pdtalk.onConnected = function(){
	console.log('outgoing connection ready');
	pdtalk.send('hi pd;\n');
	
	planet.onReceive = function(component, payload){
		// console.log(component.replace(/\:/, ' '), payload);
		pdtalk.send(component.replace(/\:/, ' ') + ' ' + payload + ';\n');
	};
};

pdtalk.onClose = function(){
	console.log('pd quit!');
};


pdtalk.onListening = function(){
	console.log('incomming connection ready');
	pdtalk.connect();
};

pdtalk.onReceive = function(buffer){
	console.log('data coming from pd:', buffer);
};

pdtalk.listen();



})();
