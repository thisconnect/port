var expect = require('expect.js');

var port = require('../');


describe('Port Events', function(){


	it('should test the scope of all event callbacks', function(done){

		var pd = port({
			read: 8015, // [netsend]
			write: 8016, // [netreceive]
			flags: ['-noprefs', '-nogui', __dirname + '/test-net.pd']
		});

		// listens for [netsend]
		pd.on('listening', function(){
			expect(this).to.be(pd);
			expect(this).to.be.a(port);
		});

		// [netsend] socket
		pd.on('connection', function(socket){
			expect(this).to.be(pd);
			expect(this).to.be.a(port);
		});

		// [netreceive] socket
		pd.on('connect', function(socket){
			expect(this).to.be(pd);
			expect(this).to.be.a(port);

			// sends data to [netreceive]
			this.write('send Hello Pd!;\n');
		});

		// receives data from [print]
		pd.on('stderr', function(buffer){
			expect(this).to.be(pd);
			expect(this).to.be.a(port);
		});

		// receives data from [netsend]
		pd.on('data', function(data){
			expect(this).to.be(pd);
			expect(this).to.be.a(port);

			// end pd
			this.destroy()
		});

		// fired after destroy completes
		pd.on('destroy', function(){
			expect(this).to.be(pd);
			expect(this).to.be.a(port);
		});

		// fires after pd process ends
		pd.on('exit', function(code, signal){
			expect(this).to.be(pd);
			expect(this).to.be.a(port);
			done();
		});

		pd.create();

	});


	it('should create, write and destroy 20 times', function(done){

		var i = 1;

		var pd = port({
			read: 8015, // [netsend]
			write: 8016, // [netreceive]
			encoding: 'ascii',
			flags: ['-noprefs', '-nogui', __dirname + '/test-net.pd']
		});

		pd.on('stderr', function(buffer){});
		pd.on('listening', function(){});
		pd.on('connection', function(socket){});

		pd.on('connect', function(socket){
			pd.write('send Hello Pd!;\n');
		});

		pd.on('data', function(data){
			expect(data).to.be('Hello Pd!;\n');
			pd.destroy()
		});

		pd.on('destroy', function(){
			if (i++ < 20) pd.create();
			else done();
		});

		pd.on('exit', function(code, signal){
			expect(arguments.length).to.be(2);
		});

		pd.create();

	});


});
