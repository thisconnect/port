exports.setup = function(Tests){

var path = require('path'),
	station = require('../../station');

var dir = path.dirname(path.relative(process.cwd(), process.argv[1]));


Tests.describe('Pd connection', function(it){


	it('should listen to a connection from [netsend], open Pd, connect to [netreceive]', function(expect){
		expect.perform(4);

		station({
			read: 8005, // [netsend]
			write: 8006, // [netreceive]
			flags: ['-noprefs', '-nogui', dir + '/suites/test.connect.pd']
		})
		.on('reader', function(socket){
			expect(socket).toBeType('object');
			expect(socket.toString()).toBeTruthy();
		})
		.on('writer', function(socket){
			expect(socket).toBeType('object');
			expect(socket.toString()).toBeTruthy();
			this.destroy();
		})
		.on('error', function(error){
			console.log('error', error);
		})
		.create();

	});


	it('should receive messages sent to Pd', function(expect){
		expect.perform(10);

		var pd = station({
			read: 8015, // [netsend]
			write: 8016, // [netreceive]
			flags: ['-noprefs', '-nogui', dir + '/suites/test.echo.pd']
		});

		pd.on('reader', function(socket){
// console.log('\n reader socket ', socket);
			expect(socket).toBeType('object');
			expect(socket.toString()).toBeTruthy();
			expect(this).toEqual(pd);
			expect(this).toBeAnInstanceOf(station);
		});

		pd.on('writer', function(socket){
// console.log('\n writer ', socket);
			// send data to [netreceive]
			expect(this).toEqual(pd);
			expect(this).toBeAnInstanceOf(station);
			pd.write('Hello Pd!;\n');
		});

		pd.on('data', function(buffer){
			// receive data from [netsend]
			expect(buffer).toBeType('string');
			expect(buffer).toEqual('Hello Pd!;\n');
			expect(this).toEqual(pd);
			expect(this).toBeAnInstanceOf(station);
			pd.destroy()
		});

		pd.on('error', function(error){
			console.log('error', error);
		});

		pd.create();

	});


	it('should open 2 Pd instances in parallel (using test 2 and 3)', function(expect){
		expect.perform(4);

		var one = station({
			read: 8005, // [netsend]
			write: 8006, // [netreceive]
			flags: ['-noprefs', '-nogui', dir + '/suites/test.connect.pd']
		});

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

		two.on('reader', function(socket){
			// send a message to [netreceive]
			two.write('Hello Pd!;\n');
		});

		one.on('writer', function(socket){
			expect(socket).toBeType('object');
			expect(socket.toString()).toBeTruthy();
			two.create();
		});

		one.create();

	});

});

};

