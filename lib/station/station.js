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
	console.log('DATA (from pd [print])', chunk.toString().trim());
});


// listen to connections from [netsend]
receiver.on('connection', function(socket){

	// receive data from [netsend]
	socket.on('data', function(buffer){
		console.log('DATA (from pd [netsend])', buffer.trim());
	});

	// connect to [netreceive]
	var sender = pd.connect(8004);
	sender.on('connect', function(){

		var client = planet.connect('http://localhost:8999'),
			state = {},
			put = function(data){
				var components = '',
					values = '';
				for (var key in data){
					if (state[key] != data[key]){
						components += 'set ' + key + ' ' + Object.keys(data[key])[0] + ';\n';
						values += pd.toFUDI(data[key]);
						state[key] = data[key];
					}
				}
				sender.write(components + values);
				//console.log('CREATE', components + values);
			};

		client.on('initial state', put);
		client.on('put', put);

		client.on('state update', function(data){
			var key = data.key,
				path = data.path,
				value = data.value;

			if (data.key == null){
				key = (typeof path == 'string') 
					? path.replace(/\./g, ' ')
					: path.join(' ');
			}
			if (Array.isArray(value)) value = value.join(' ');
			sender.write(key + ' ' + value + ';\n');
			console.log('UPDATE', key + ' ' + value + ';\n');
		});

	});
});


