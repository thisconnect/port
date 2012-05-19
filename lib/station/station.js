var os = require('os'),
	pd = require('../../lib/station/modules/pd').Wrapper,
	planet = require('../../lib/station/modules/planet').Client;;


function getPdPath(){
	if (os.platform() == 'darwin'){
		return '/Applications/Pd-0.43-2.app/Contents/Resources/bin/pd';
	} else {
		return 'pd';
	}
}


var receiver = pd.listen(8003),
	puredata = pd.start(getPdPath(), ['-stderr', '-noprefs', './base.pd']);

receiver.on('error', function(error){
	console.log('ERROR', error);
});


// logs data from [print] 
puredata.stderr.on('data', function(chunk){
	console.log('data: ' + chunk);
});


// listen to connections from [netsend]
receiver.on('connection', function(socket){

	// receive data from [netsend]
	socket.on('data', function(buffer){
		console.log('receiving data (from pd [netsend])', buffer.trim());
	});

	// connect to [netreceive]
	var sender = pd.connect(8004);
	sender.on('connect', function(){
		sender.write('Hi Pd!;\n');
		//sender.write(['send Hello Pd!', 'disconnect'].join(';\n'));
		
		
		
		
		var client = planet.connect('http://localhost:8999');

		client.on('initial state', function(data){
			console.log('initial state', data);
		});
		
		client.on('state update', function(data){
			console.log('state update', data);
		});
		
		client.on('put', function(data){
			console.log('put', data);
		});

	});
});


