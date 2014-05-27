var expect = require('expect.js');

var port = require('../');


describe('Port Flags', function(){


	it('should accept array (deprecated) and object for flags', function(done){

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
			//  deprecated syntax
			port.prototype.parseFlags({
				'-r': 44100,
				'-noprefs': true,
				'-nogui': true,
				'-path': __dirname,
				'-open': 'test-loadbang.pd'
			})
		).to.eql(
			port.prototype.parseFlags({
				'r': 44100,
				'noprefs': true,
				'nogui': true,
				'path': __dirname,
				'open': 'test-loadbang.pd'
			})
		);

		done();

	});

	it('should not add -path if basepath and path are missing', function(done){

		expect(
			['-noprefs', '-open', __dirname + 'test-loadbang.pd']
		).to.eql(
			port.prototype.parseFlags({
				'-noprefs': true,
				'-open': __dirname + 'test-loadbang.pd'
			})
		);

		done();

	});

});
