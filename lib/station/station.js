(function(){

var planet	= require('./modules/planet.js').Client,
	pdtalk = require('./modules/pd.js').Connection;

// planet

planet.onConnected = function(){
	console.log('planet connection up');
};


// pd

pdtalk.onConnected = function(){
	console.log('outgoing connection ready');
	pdtalk.send('hi pd;\n');
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
