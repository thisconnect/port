exports.setup = function(Tests){

var path = require('path'),
	station = require('../../station');

var dir = path.dirname(path.relative(process.cwd(), process.argv[1]));


Tests.describe('Pd wrapper', function(it){


	it('should open Pd -stderr and receive a bang from [print]', function(expect){
		expect.perform(3);

		station({
			flags: ['-noprefs', '-stderr', '-nogui', dir + '/suites/test.loadbang.pd'],
			onStderr: function(buffer){
				expect(buffer).toBeType('object');
				expect(buffer.toString()).toBeTruthy();
				expect(buffer.toString().trim()).toEqual('print: bang');
				this.destroy();
			},
			onError: function(error){
				console.log('error', error);
			}
		}).create();

	});

});

};
