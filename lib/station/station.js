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

		var client = planet.connect('http://localhost:8999');
		
		// https://tinker.io/84b96/2
		function toFUDI(o, pre){
			var paket = [];
			if (pre == null) pre = '';
			for (var p in o) {
				if (o[p] != null){ 
					if (Array.isArray(o[p])) paket.push(pre + p + ' ' + o[p].join(' '));
					else if (typeof o[p] == 'object') paket.push(toFUDI(o[p], pre + p + ' '));
					else paket.push(pre + p + ' ' + o[p]);
				}
			}
			if (pre == '') paket.push('');
			return paket.join(';\n');
		}



		client.on('initial state', function(data){
			sender.write(toFUDI(data));
			console.log('initial state', toFUDI(data));
		});

		client.on('put', function(data){
			sender.write(toFUDI(data));
			console.log('put', toFUDI(data));
		});

		client.on('state update', function(data){
			var key;
			if (data.key != null) key = data.key;
			else {
				key = (typeof data.path == 'string') 
					? data.path.replace(/\./g, ' ')
					: data.path.join(' ');
			}
			sender.write(key + ' ' + data.value + ';\n');
			console.log('update', key + ' ' + data.value + ';\n');
		});

	});
});


