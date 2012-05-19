var os = require('os'),
	pd = require('../../lib/station/modules/pd').Wrapper;


function getPdPath(){
	if (os.platform() == 'darwin'){
		return '/Applications/Pd-0.43-2.app/Contents/Resources/bin/pd';
	} else {
		return 'pd';
	}
}


var receiver = pd.listen(8003),
	puredata = pd.start(getPdPath(), ['-stderr', '-noprefs', './base.pd']);


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
	});
});


receiver.on('error', function(error){
	console.log('pd.onError', error);
});

