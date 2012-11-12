exports.setup = function(Tests){

var path = require('path'),
	station = require('../../station');

var dir = path.dirname(path.relative(process.cwd(), process.argv[1]));


Tests.describe('Pd connection', function(it){


	it('should listen to a connection from [netsend], open Pd, connect to [netreceive]', function(expect){
		expect.perform(8);

		var pd = station({
			read: 8005, // [netsend]
			write: 8006, // [netreceive]
			flags: ['-noprefs', '-nogui', dir + '/suites/test.connect.pd']
		});

		pd.on('reader', function(socket){
			expect(socket).toBeType('object');
			expect(socket.toString()).toBeTruthy();
			expect(this).toEqual(pd);
			expect(this).toBeAnInstanceOf(station);
		});

		pd.on('writer', function(socket){
			expect(socket).toBeType('object');
			expect(socket.toString()).toBeTruthy();
			expect(this).toEqual(pd);
			expect(this).toBeAnInstanceOf(station);
			this.destroy();
		});

		pd.on('error', function(error){
			console.log('error', error);
		});

		pd.create();

	});


	it('should receive messages sent to Pd', function(expect){
		expect.perform(3);

		station({
			read: 8015, // [netsend]
			write: 8016, // [netreceive]
			flags: ['-noprefs', '-nogui', dir + '/suites/test.echo.pd']
		})
		.on('data', function(buffer){
			// receive data from [netsend]
			expect(buffer).toBeType('string');
			expect(buffer).toEqual('Hello Pd!;\n');
			expect(this).toBeAnInstanceOf(station);
			this.destroy()
		})
		.on('writer', function(){
			// send data to [netreceive]
			this.write('send Hello Pd!;\n');
		})
		.on('error', function(error){
			console.log('error', error);
		})
		.create();

	});


	it('should open 2 Pd instances in parallel (using test 2 and 3)', function(expect){
		expect.perform(6);

		var one = station({
			read: 8005, // [netsend]
			write: 8006, // [netreceive]
			flags: ['-noprefs', '-nogui', dir + '/suites/test.connect.pd']
		});

		one.on('reader', function(socket){
			expect(socket).toBeType('object');
			expect(socket.toString()).toBeTruthy();
		});

		one.on('writer', function(socket){
			expect(socket).toBeType('object');
			expect(socket.toString()).toBeTruthy();

			var two = station({
				read: 8015, // [netsend]
				write: 8016, // [netreceive]
				flags: ['-noprefs', '-nogui', dir + '/suites/test.echo.pd']
			});

			two.on('data', function(buffer){
				// receive data from [netsend]
				expect(buffer).toBeType('string');
				expect(buffer).toEqual('Hello Pd!;\n');
				one.destroy();
				two.destroy()
			});

			two.on('reader', function(){
				// send data to [netreceive]
				this.write('send Hello Pd!;\n');
			});

			two.create();

		});

		one.create();

	});

});

};

