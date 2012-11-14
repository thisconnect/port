exports.setup = function(Tests){

var path = require('path'),
	station = require('../../station');

var dir = path.dirname(path.relative(process.cwd(), process.argv[1]));


Tests.describe('Station connection', function(it){


	it('should expose 2 sockets for [netsend] and [netreceive]', function(expect){
		expect.perform(3);

		station({
			read: 8005, // [netsend]
			write: 8006, // [netreceive]
			flags: ['-noprefs', '-nogui', dir + '/suites/test.connect.pd']
		})
		.on('connection', function(socket){
			expect(socket).toBeType('object');
		})
		.on('connect', function(socket){
			expect(socket).toBeType('object');
			this.destroy();
		})
		.on('destroy', function(){
			expect(this).toBeAnInstanceOf(station);
		})
		.create();

	});


	it('should echo messages sent to Pd', function(expect){
		expect.perform(6);

		var pd = station({
			read: 8015, // [netsend]
			write: 8016, // [netreceive]
			flags: ['-noprefs', '-nogui', dir + '/suites/test.echo.pd']
		});

		// [netreceive] socket
		pd.on('connect', function(socket){
			expect(socket.write).toBeType('function');
			expect(this.write).toBeType('function');
			expect(pd.write).toBeType('function');
			// sends data to [netreceive]
			socket.write('Hello Pd!;\n');
		});

		// receives data from [netsend]
		pd.on('data', function(data){
			expect(data).toBeType('string');
			expect(data).toEqual('Hello Pd!;\n');
			pd.destroy()
		});

		// fires after pd process ends
		pd.on('exit', function(code, signal){
			expect(arguments.length).toBe(2);
		});

		pd.create();

	});


	it('should connect to two Pd instances in parallel', function(expect){
		expect.perform(3);

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

		two.on('data', function(data){
			expect(data).toBeType('string');
			expect(data).toEqual('Hello Pd!;\n');
			one.destroy();
			two.destroy()
		});

		two.on('connect', function(socket){
			socket.write('Hello Pd!;\n');
		});

		one.on('connect', function(socket){
			expect(socket).toBeType('object');
			two.create();
		});

		one.create();

	});


	it('should establish a one way connection, listening only', function(expect){
		expect.perform(4);

		var pd = station({
			read: 8025, // [netsend]
			flags: ['-noprefs', '-nogui', dir + '/suites/test.netsend.number.pd']
		});

		pd.on('data', function(data){
			expect(data).toBeType('string');
			expect(data.substr(-2)).toEqual(';\n');
			expect(parseInt(data.slice(0, -2))).toBeType('number');
			expect(data).toEqual('100;\n');
			pd.destroy();
		});

		pd.create();

	});

});

};

