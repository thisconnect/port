exports.setup = function(Tests){

var path = require('path'),
	station = require('../../station');

var dir = path.dirname(path.relative(process.cwd(), process.argv[1]));


Tests.describe('Pd connection', function(it){


	it('should listen to a connection from [netsend], open Pd, connect to [netreceive]', function(expect){
		expect.perform(4);

		station({
			read: 8001, // [netsend]
			write: 8002, // [netreceive]
			flags: ['-noprefs', '-nogui', dir + '/suites/test.connect.pd'],
			onReader: function(socket){
				expect(socket).toBeType('object');
				expect(socket.toString()).toBeTruthy();
			},
			onWriter: function(socket){
				expect(socket).toBeType('object');
				expect(socket.toString()).toBeTruthy();
				this.destroy();
			},
			onError: function(error){
				console.log('error', error);
			}
		}).listen().create();

	});


	it('should receive messages sent to Pd', function(expect){
		expect.perform(2);

		station({
			read: 8003, // [netsend]
			write: 8004, // [netreceive]
			flags: ['-noprefs', '-nogui', dir + '/suites/test.io.pd'],
			onData: function(buffer){ // receive data from [netsend]
				expect(buffer).toBeType('string');
				expect(buffer).toEqual('Hello Pd!;\n');
				this.destroy()
			},
			onReady: function(){
				this.write('send Hello Pd!;\n'); // send data to [netreceive]
			},
			onError: function(error){
				console.log('error', error);
			}
		}).listen().create();

	});


	it('should open 2 Pd instances in parallel (using test 2 and 3)', function(expect){
		expect.perform(6);

		var one = station({
			read: 8001, // [netsend]
			write: 8002, // [netreceive]
			flags: ['-noprefs', '-nogui', dir + '/suites/test.connect.pd'],
			onReader: function(socket){
				expect(socket).toBeType('object');
				expect(socket.toString()).toBeTruthy();
			},
			onWriter: function(socket){
				expect(socket).toBeType('object');
				expect(socket.toString()).toBeTruthy();
				
				
				var two = station({
					read: 8003, // [netsend]
					write: 8004, // [netreceive]
					flags: ['-noprefs', '-nogui', dir + '/suites/test.io.pd'],
					onData: function(buffer){ // receive data from [netsend]
						expect(buffer).toBeType('string');
						expect(buffer).toEqual('Hello Pd!;\n');
						one.destroy();
						two.destroy()
					},
					onReady: function(){
						this.write('send Hello Pd!;\n'); // send data to [netreceive]
					},
					onError: function(error){
						console.log('error', error);
					}
				});
				
				two.listen();
				two.create();
				
				
			},
			onError: function(error){
				console.log('error', error);
			}
		});
		
		one.listen();
		one.create();


	});

});

};

