exports.setup = function(Tests){

var path = require('path'),
	station = require('../../station');

var dir = path.dirname(path.relative(process.cwd(), process.argv[1]));


Tests.describe('Station Events', function(it){


	it('should test the scope of all event callbacks', function(expect){
		expect.perform(14);

		var pd = station({
			read: 8015, // [netsend]
			write: 8016, // [netreceive]
			flags: ['-noprefs', '-nogui', dir + '/suites/test.net.pd']
		});

		// listens for [netsend]
		pd.on('listening', function(){
			expect(this).toEqual(pd);
			expect(this).toBeAnInstanceOf(station);
		});

		// [netsend] socket
		pd.on('connection', function(socket){
			expect(this).toEqual(pd);
			expect(this).toBeAnInstanceOf(station);
		});

		// [netreceive] socket
		pd.on('connect', function(socket){
			expect(this).toEqual(pd);
			expect(this).toBeAnInstanceOf(station);

			// sends data to [netreceive]
			this.write('send Hello Pd!;\n');
		});

		// receives data from [print]
		pd.on('stderr', function(buffer){
			expect(this).toEqual(pd);
			expect(this).toBeAnInstanceOf(station);
		});

		// receives data from [netsend]
		pd.on('data', function(data){
			expect(this).toEqual(pd);
			expect(this).toBeAnInstanceOf(station);

			// end pd
			this.destroy()
		});

		// fired after destroy completes
		pd.on('destroy', function(){
			expect(this).toEqual(pd);
			expect(this).toBeAnInstanceOf(station);
		});

		// fires after pd process ends
		pd.on('exit', function(code, signal){
			expect(this).toEqual(pd);
			expect(this).toBeAnInstanceOf(station);
		});

		pd.create();

	});


	it('should create, write and destroy 20 times', function(expect){
		expect.perform(40);

		var i = 1;

		var pd = station({
			read: 8015, // [netsend]
			write: 8016, // [netreceive]
			flags: ['-noprefs', '-nogui', dir + '/suites/test.net.pd']
		});

		pd.on('stderr', function(buffer){});
		pd.on('listening', function(){});
		pd.on('connection', function(socket){});

		pd.on('connect', function(socket){
			pd.write('send Hello Pd!;\n');
		});

		pd.on('data', function(data){
			expect(data).toBe('Hello Pd!;\n');
			pd.destroy()
		});

		pd.on('destroy', function(){
			if (i++ < 20) pd.create();
		});

		pd.on('exit', function(code, signal){
			expect(arguments.length).toBe(2);
		});

		pd.create();

	});


});

};

