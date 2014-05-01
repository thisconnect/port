var expect = require('expect.js');

var port = require('../');


describe('Port Flags', function(){


	it('should accept arrays and objects for flags ', function(done){

		expect(
			port.prototype.parseFlags(['-noprefs', '-nogui', '-path', __dirname, '-open', 'test-loadbang.pd'])
		).to.eql(
			port.prototype.parseFlags({
				'-noprefs': true,
				'-nogui': true,
				'-path': __dirname,
				'-open': 'test-loadbang.pd'
			})
		);

		done();

	});

	it('should automatically prefix object flags with dash', function(done){

		expect(
			port.prototype.parseFlags({
				'-noprefs': true,
				'-nogui': true,
				'-path': __dirname,
				'-open': 'test-loadbang.pd'
			})
		).to.eql(
			port.prototype.parseFlags({
				'noprefs': true,
				'nogui': true,
				'path': __dirname,
				'open': 'test-loadbang.pd'
			})
		);

		done();

	});

/*
	it('should accept an object for flags ', function(done){

		var pd = port({
			flags: {
				'-noprefs': true,
				'-nogui': true,
				'-path': __dirname,
				'-open': 'test-loadbang.pd'
			}
		});

		var flags = pd.parseFlags({
				'-noprefs': true,
				'-nogui': true,
				'-path': __dirname,
				'-open': 'test-loadbang.pd'
			});
console.log(flags);
		expect(pd).to.be.a(port);

		pd.on('stderr', function(buffer){
			expect(buffer).to.be.an('object');
			expect(buffer.toString()).to.be.ok();
			expect(buffer.toString().trim()).to.be('print: bang');
			pd.destroy();
			done();
		});

		pd.create();

	});


	it('should add the minus prefix on an object of flags ', function(done){

		var pd = port({
			flags: {
				'noprefs': true,
				'nogui': true,
				'path': __dirname,
				'open': 'test-loadbang.pd'
			}
		});

		expect(pd).to.be.a(port);

		pd.on('stderr', function(buffer){
			expect(buffer).to.be.an('object');
			expect(buffer.toString()).to.be.ok();
			expect(buffer.toString().trim()).to.be('print: bang');
			pd.destroy();
			done();
		});

		pd.create();

	});


	it('should send a message to Pd using the -send flag', function(done){

		var received = '';

		port({
			flags: [
				'-noprefs', '-nogui',
				'-send', 'node hi Pd!',
				'-open', __dirname + '/test-receive.pd'
			]
		})
		.on('stderr', function(buffer){
			received += buffer.toString();
			if (!!received.match(/\n$/)){
				expect(received).to.be('print: hi Pd!\n');
				expect(received.toString().slice(0, -1)).to.be('print: hi Pd!');
				this.destroy();
				done();
			}
		})
		.create();

	});


	it('should send a long message to Pd using the -send flag', function(done){

		var received = '',
			data = [
				0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
				10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
				20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
				30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
				40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
				50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
				60, 61, 62, 63, 64, 65, 66, 67, 68, 69,
				70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
				80, 81, 82, 83, 84, 85, 86, 87, 88, 89,
				90, 91, 92, 93, 94, 95, 96, 97, 98, 99
			].join(' ');


		port({
			flags: ['-noprefs', '-nogui', '-stderr',
				'-send', 'node ' + data,
				'-open', __dirname + '/test-receive.pd']
		})
		.on('stderr', function(buffer){
			received += buffer.toString();
			if (!!received.match(/\n$/)){
				expect(received).to.be('print: ' + data + '\n');
				this.destroy();
				done();
			}
		})
		.create();

	});


	it('should send many messages to Pd using the -send flag', function(done){

		var in1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			in2 = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
			result = {
				'out1': [],
				'out2': []
			};

		port({
			flags: [
				'-noprefs', '-nogui', '-stderr',
				'-send', 'in1 ' + in1.toString() + ';in2 ' + in2.toString(),
				'-open', __dirname + '/test-receivers.pd'
			]
		})
		.on('stderr', function(buffer){
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
				expect(result.out1).to.eql(in1);
				expect(result.out2).to.eql(in2);
				this.destroy();
				done();
			}
		})
		.create();

	});
*/
});
