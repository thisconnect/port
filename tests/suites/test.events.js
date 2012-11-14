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

		// fires after pd process ends
		pd.on('exit', function(code, signal){
			expect(this).toEqual(pd);
			expect(this).toBeAnInstanceOf(station);
		});

		// fired after destroy completes
		pd.on('destroy', function(){
			expect(this).toEqual(pd);
			expect(this).toBeAnInstanceOf(station);
		});

		pd.create();

	});


});

};
