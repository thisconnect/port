var pd = require('../../lib/station/modules/pd').Wrapper,
	planet = require('../../lib/station/modules/planet').Client;;


function getPdPath(){
	if (process.platform == 'darwin'){
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

process.on('exit', function(){
	puredata.kill();
});


// logs data from [print] 
puredata.stderr.on('data', function(chunk){
	console.log('___________________________DATA (from pd [print])', chunk.toString().trim());
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
			state = {};

		var put = function(data){
			var components = '',
				values = '';
			for (var pos in data){
				for (var component in data[pos]){
					if (state[pos] != component){
						components += 'set ' + pos + ' ' + component + ';\n';
						values += pd.toFUDI(data[pos][component], 'list space.' + pos + ' ');
						state[pos] = component;
					}
				}
			}
			sender.write(components + values + ';\n');
			console.log('CREATE', components + values + ';\n');
		};

		client.on('initial state', put);
		client.on('put', put);

		client.on('post', function(data){
			var path = data.path,
				value = data.value;
			
			if (data.key != null){
				path = data.key.split('.');
			}
/*
			if (data.key == null){
				key = (typeof path == 'string') 
					? path.replace(/\./g, ' ')
					: path.join(' ');
			}
*/			if (Array.isArray(value)) value = value.join(' ');
			var message = ['list', 'space.' + path[0], path[2], value].join(' ');
			sender.write(message + ';\n');
			//console.log('UPDATE', message + ';\n');
		});

	});
});


