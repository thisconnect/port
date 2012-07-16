exports.setup = function(Tests){

var path = require('path'),
	station = require('../../station');

var dir = path.dirname(path.relative(process.cwd(), process.argv[1]));


Tests.describe('Pd wrapper', function(it){


	it('should open Pd, setup listener and sender', function(expect){
		expect.perform(3);

		var space = new station({
			read: 8001,
			write: 8002,
			flags: ['-stderr', '-noprefs', '-nogui', dir +'/suites/test.loadbang.pd'],
			onInit: null,
			onStderr: function(buffer){
				expect(buffer).toBeType('object');
				expect(buffer.toString()).toBeTruthy();
				expect(buffer.toString().trim()).toEqual('print: bang');
				this.destroy();
			},
			onError: function(error){
				console.log('error', error);
			}
		});
		space.create();
/*
		// listen to connections from [netsend]
		receiver.on('connection', function(socket){

			// connect to [netreceive]
			var sender = pd.connect(8002);
			sender.on('connect', function(){
				expect(true).toBeTruthy();
				receiver.close();
				sender.destroy();
				puredata.kill();
			});
		});

		space.on('error', function(error){
			console.log('pd.onError', error);
		});
*/
	});

/*
	it('should receive a message returned from Pd', function(expect){

		var receiver = pd.listen(8003),
			puredata = pd.start(getPdPath(), ['-nogui', '-stderr', '-noprefs', dir +'/suites/test.io.pd']);

		// listen to connections from [netsend]
		receiver.on('connection', function(socket){

			// receive data from [netsend]
			socket.on('data', function(buffer){
				expect(buffer.trim()).toBe('Hello Pd!;');
				receiver.close();
				sender.destroy();
				puredata.kill();
			});

			// connect to [netreceive]
			var sender = pd.connect(8004);
			sender.on('connect', function(){
				//sender.write('send Hello Pd!;\n');
				sender.write(['send Hello Pd!', 'disconnect'].join(';\n'));
			});
		});

		receiver.on('error', function(error){
			console.log('pd.onError', error);
		});
	});


	it('should open 2 Pd instances in parallel', function(expect){

		var receiver1 = pd.listen(8001),
			receiver2 = pd.listen(8003),
			puredata1 = pd.start(getPdPath(), ['-nogui', '-stderr', '-noprefs', dir +'/suites/test.connect.pd']),
			puredata2 = pd.start(getPdPath(), ['-nogui', '-stderr', '-noprefs', dir +'/suites/test.io.pd']);


		// listen to connections from [netsend]
		receiver1.on('connection', function(socket1){

			// connect to [netreceive]
			var sender1 = pd.connect(8002);
			sender1.on('connect', function(){
				expect(true).toBeTruthy();
			});
		});


		// listen to connections from [netsend]
		receiver2.on('connection', function(socket2){

			// receive data from [netsend]
			socket2.on('data', function(buffer){
				expect(buffer.trim()).toBe('Hello Pd2!;');
				setTimeout(function(){
					puredata1.kill();
					puredata2.kill();
					process.exit();
				}, 1000);
			});

			// connect to [netreceive]
			var sender2 = pd.connect(8004);
			sender2.on('connect', function(){
				sender2.write('send Hello Pd2!;\n');
			});
		});

		receiver1.on('error', function(error){ console.log('pd.onError', error); });
		receiver2.on('error', function(error){ console.log('pd.onError', error); });

	});
*/
});

};

