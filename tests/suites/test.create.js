exports.setup = function(Tests){

var path = require('path'),
	station = require('../../station');

var dir = path.dirname(path.relative(process.cwd(), process.argv[1]));


Tests.describe('Station create', function(it){


	it('should create a Pd process with -nogui flag and receive data from [print]', function(expect){
		expect.perform(4);

		var pd = station({
			flags: ['-noprefs', '-nogui', dir + '/suites/test.loadbang.pd']
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


	it('should create and destroy 20 times in a row', function(expect){
		expect.perform(20);

		var i = 1;

		var pd = station({
			flags: ['-noprefs', '-nogui', dir + '/suites/test.loadbang.pd']
		});

		pd.on('print', function(buffer){
			expect(buffer.toString().trim()).toEqual('print: bang');
			pd.destroy();
		});

		pd.on('destroy', function(){
			if (i++ < 20) pd.create();
		});

		pd.create();

	});


	it('should create a Pd process with -stderr flag and receive data from [print]', function(expect){
		expect.perform(8);

		var pd = station({
			flags: ['-noprefs', '-stderr', dir + '/suites/test.loadbang.pd']
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
			flags: [
				'-noprefs', '-nogui',
				'-send', 'node hi Pd!',
				'-open', dir + '/suites/test.receive.pd'
			]
		})
		.on('print', function(buffer){
			expect(buffer).toBeType('object');
			expect(buffer).toEqual('print: hi Pd!\n');
			expect(buffer.toString().slice(0, -1)).toEqual('print: hi Pd!');
			this.destroy();
		})
		.create();

	});


	it('should send a long message to Pd using the -send flag', function(expect){
		expect.perform(1);

		var data = [], received = '';

		data.push(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
		data.push(10, 11, 12, 13, 14, 15, 16, 17, 18, 19);
		data.push(20, 21, 22, 23, 24, 25, 26, 27, 28, 29);
		data.push(30, 31, 32, 33, 34, 35, 36, 37, 38, 39);
		data.push(40, 41, 42, 43, 44, 45, 46, 47, 48, 49);
		data.push(50, 51, 52, 53, 54, 55, 56, 57, 58, 59);
		data.push(60, 61, 62, 63, 64, 65, 66, 67, 68, 69);
		data.push(70, 71, 72, 73, 74, 75, 76, 77, 78, 79);
		data.push(80, 81, 82, 83, 84, 85, 86, 87, 88, 89);
		data.push(90, 91, 92, 93, 94, 95, 96, 97, 98, 99);

		data = data.join(' ');

		station({
			flags: ['-noprefs', '-nogui', '-stderr',
				'-send', 'node ' + data,
				'-open', dir + '/suites/test.receive.pd']
		})
		.on('print', function(buffer){
			received += buffer.toString();
			if (!!received.match(/\n$/)){
				expect(received).toEqual('print: ' + data + '\n');
				this.destroy();
			}
		})
		.create();

	});


	it('should send many messages to Pd using the -send flag', function(expect){
		expect.perform(2);

		var in1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			in2 = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
			result = {
				'out1': [],
				'out2': []
			};

		station({
			flags: [
				'-noprefs', '-nogui', '-stderr',
				'-send', 'in1 ' + in1.toString() + ';in2 ' + in2.toString(),
				'-open', dir + '/suites/test.receivers.pd'
			]
		})
		.on('print', function(buffer){
			var packet = buffer.toString().split('\n');
			packet.forEach(function(message){

				// parses each message into `<key>: <value>`
				var p = message.match(/^(.+):\s(\d+)$/);

				// parses integer and stores in results
				if (!!p) result[p[1]].push(parseInt(p[2]));
			});

			if (in1.length == result.out1.length
				&& in2.length == result.out2.length
			){
				expect(result.out1).toBeSimilar(in1);
				expect(result.out2).toBeSimilar(in2);
				this.destroy();
			}
		})
		.create();

	});

});

};
