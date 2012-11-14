exports.setup = function(Tests){

var path = require('path'),
	station = require('../../station');

var dir = path.dirname(path.relative(process.cwd(), process.argv[1]));


Tests.describe('Station create', function(it){

/*
	it('should create a Pd process with -nogui flag and receive data from [print]', function(expect){
		expect.perform(4);

		var pd = station({
			flags: ['-noprefs', '-nogui', dir + '/suites/test.create.pd']
		});

		expect(pd).toBeAnInstanceOf(station);

		// 'print' event available in '-nogui' mode
		pd.on('print', function(buffer){
			expect(buffer).toBeType('object');
			expect(buffer.toString()).toBeTruthy();
			expect(buffer.toString().trim()).toEqual('print: bang');
			this.destroy();
		});

		pd.create();

	});


	it('should create a Pd process with -stderr flag and receive data from [print]', function(expect){
		expect.perform(8);

		var pd = station({
			flags: ['-noprefs', '-stderr', dir + '/suites/test.create.pd'] //'-stderr', 
		});

		expect(pd).toBeAnInstanceOf(station);

		// 'print' event available in '-nogui' mode
		pd.on('print', function(buffer){
			expect(buffer).toBeType('object');
			expect(buffer.toString()).toBeTruthy();
			expect(buffer.toString().trim()).toEqual('print: bang');
			expect(this).toEqual(pd);
			expect(this).toBeAnInstanceOf(station);
			this.destroy();
		});

		pd.on('destroy', function(){
			expect(this).toEqual(pd);
			expect(this).toBeAnInstanceOf(station);
		});

		pd.create();

	});


	it('should send a message to Pd using the -send flag', function(expect){
		expect.perform(3);

		station({
			flags: ['-noprefs', '-nogui', '-send', 'nodejs hi Pd!', '-open', dir + '/suites/test.receive.pd']
		})
		.on('print', function(buffer){
			expect(buffer).toBeType('object');
			expect(buffer).toEqual('print: hi Pd!\n');
			expect(buffer.toString().slice(0, -1)).toEqual('print: hi Pd!');
			this.destroy();
		})
		.create();

	});
*/

	it('should send a very long message to Pd using the -send flag', function(expect){
		expect.perform(3);

		var list = '0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19';

		var pd = station({
			flags: ['-noprefs', '-nogui',
				'-send', 'nodejs ' + list,
				'-open', dir + '/suites/test.receive.pd']
		})
		.on('print', function(buffer){
			console.log('\n--------------', buffer.toString(), '\n--------------');
			expect(buffer).toBeType('object');
			expect(buffer).toEqual('print: ' + list + '\n');
			expect(buffer.toString().slice(0, -1)).toEqual('print: ' + list);
		})
		.create();

		setTimeout(function(){
			pd.destroy();
		}, 100);

	});

});

};
