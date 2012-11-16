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
			flags: ['-noprefs', '-nogui', dir + '/suites/test.echo.pd']
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
			this.write('Hello Pd!;\n');
		});

		// receives data from [print]
		pd.on('print', function(buffer){
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


	it('should detect possible event emitter memory leaks', function(expect){
		expect.perform(8);

		var i = 1;

		var pd = station({
			read: 8035, // [netsend]
			write: 8036, // [netreceive]
			flags: ['-noprefs', '-nogui', dir + '/suites/test.netsend.pd']
		});

		// receives data from [print]
		pd.on('print', function(buffer){
	//		console.log('\nstderr:', i, buffer.toString());
		});

		// listens for [netsend]
		pd.on('listening', function(){
		});

		// [netsend] socket
		pd.on('connection', function(socket){
		});

		// [netreceive] socket
		pd.on('connect', function(socket){
		//	console.log('connect', i);
			pd.write('send Hello Pd!;\n');
		});

		// receives data from [netsend]
		pd.on('data', function(data){
		//	console.log('data', i, data);
			pd.destroy()
		});

		// fired after destroy completes
		pd.on('destroy', function(){
			//console.log('destroy', i);
		});

		// fires after pd process ends
		pd.on('exit', function(code, signal){
	//		console.log('exit', i);
			expect(true).toBe(true);
			if (i++ < 8) pd.create();
		});

		pd.create();

	});


});

};

