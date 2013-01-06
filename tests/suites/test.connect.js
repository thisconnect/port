exports.setup = function(Tests){

var path = require('path'),
	port = require('../../port');

var dir = path.dirname(path.relative(process.cwd(), process.argv[1]));


Tests.describe('Port connection', function(it){


	it('should expose 2 sockets for [netsend] and [netreceive]', function(expect){
		expect.perform(3);

		port({
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
			expect(this).toBeAnInstanceOf(port);
		})
		.create();

	});


	it('should echo messages sent to Pd', function(expect){
		expect.perform(5);

		var pd = port({
			read: 8015, // [netsend]
			write: 8016, // [netreceive]
			encoding: 'ascii',
			flags: ['-noprefs', '-nogui', dir + '/suites/test.net.pd']
		});

		// [netreceive] socket
		pd.on('connect', function(socket){
			expect(socket.write).toBeType('function');
			expect(this.write).toBeType('function');
			expect(pd.write).toBeType('function');
			// sends data to [netreceive]
			socket.write('send Hello Pd!;\n');
		});

		// receives data from [netsend]
		pd.on('data', function(data){
			expect(data).toBeType('string');
			expect(data).toEqual('Hello Pd!;\n');
			pd.destroy();
		});

		pd.create();

	});


	it('should pass the raw buffer object if no encoding is specified', function(expect){
		expect.perform(2);

		var pd = port({
			read: 8015, // [netsend]
			write: 8016, // [netreceive]
			flags: ['-noprefs', '-nogui', dir + '/suites/test.net.pd']
		});

		pd.on('connect', function(socket){
			// sends data to [netreceive]
			socket.write('send Hello Pd!;\n');
		});

		// receives data from [netsend]
		pd.on('data', function(data){
			expect(data).toBeType('object');
			expect(data).toHaveProperty('length');
			pd.destroy();
		});

		pd.create();

	});


	it('should connect to two Pd instances in parallel', function(expect){
		expect.perform(3);

		var one = port({
			read: 8005, // [netsend]
			write: 8006, // [netreceive]
			flags: ['-noprefs', '-nogui', dir + '/suites/test.connect.pd']
		});

		var two = port({
			read: 8015, // [netsend]
			write: 8016, // [netreceive]
			encoding: 'ascii',
			flags: ['-noprefs', '-nogui', dir + '/suites/test.net.pd']
		});

		two.on('data', function(data){
			expect(data).toBeType('string');
			expect(data).toEqual('Hello Pd!;\n');
			one.destroy();
			two.destroy()
		});

		two.on('connect', function(socket){
			socket.write('send Hello Pd!;\n');
		});

		one.on('connect', function(socket){
			expect(socket).toBeType('object');
			two.create();
		});

		one.create();

	});


	it('should establish a oneway sending connection', function(expect){
		expect.perform(3);

		var pd = port({
			write: 8046, // [netreceive]
			flags: ['-noprefs', '-stderr', dir + '/suites/test.netreceive.pd']
		});

		pd.on('connect', function(){
			pd.write('hi Pd!;\n');
		});

		pd.on('stderr', function(buffer){
			expect(buffer).toBeType('object');
			buffer = buffer.toString();
			if (buffer.trim() == 'ready: bang'){
				// if there is no read socket manually fire the connection event
				pd.emit('connection');
			} else {
				expect(buffer).toEqual('print: hi Pd!\n');
				pd.destroy();
			}
		});

		pd.create();

	});


	it('should establish a oneway receiving connection', function(expect){
		expect.perform(4);

		var pd = port({
			read: 8025, // [netsend]
			encoding: 'ascii',
			flags: ['-noprefs', '-nogui', dir + '/suites/test.netsend.pd']
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


	it('should receive data from 2 [netsend] objects', function(expect){
		expect.perform(3);

		var result = 0;

		port({
			read: 8035, // [netsend]
			encoding: 'ascii',
			max: 2,
			flags: ['-noprefs', '-nogui', dir + '/suites/test.netsends.pd']
		})
		.on('data', function(data){
			data = parseInt(data.slice(0, -2));
			expect(data).toBeType('number');
			result += data;
			if (result == 3) this.destroy();
		})
		.on('destroy', function(){
			expect(result).toEqual(3);
		})
		.create();

	});


	it('should limit the incoming connections to 1', function(expect){
		expect.perform(3);

		var result = 0;

		var pd = port({
			read: 8035, // [netsend]
			//encoding: 'ascii',
			max: 1,
			flags: ['-noprefs', '-stderr', dir + '/suites/test.netsends.pd']
		})
		.on('data', function(buffer){
			var data = buffer.slice(0, 1);
			expect(data.toString()).toBeType('string');
			expect(data).toEqual(1);
			result += data;
			setTimeout(function(){ pd.destroy(); }, 500);
		})
		.on('destroy', function(){
			expect(result).toEqual(1);
		})
		.create();

	});


	it('should create and destroy a one way connection 16 times in a row', function(expect){
		expect.perform(32);

		var i = 1;

		var pd = port({
			read: 8025, // [netsend]
			encoding: 'ascii',
			flags: ['-noprefs', '-nogui', dir + '/suites/test.netsend.pd']
		});

		pd.on('error', function(error){});
		pd.on('close', function(){});
		pd.on('stderr', function(buffer){});
		pd.on('connection', function(){});

		pd.on('data', function(data){
			expect(data).toBeType('string');
			expect(data).toEqual('100;\n');
			pd.destroy();
		});

		pd.on('destroy', function(){
			if (i++ < 16) pd.create();
		});

		pd.create();

	});


	it('should allow to connect to a manually spawned Pd process', function(expect){
		expect.perform(2);

		var spawn = require('child_process').spawn;

		var pdprocess = null;

		port({
			read: 8015, // [netsend]
			write: 8016, // [netreceive]
			encoding: 'ascii',
			pd: null // prevents spawning the pd process
		})
		.on('listening', function(){
			var location = ('darwin' == process.platform)
				? '/Applications/Pd-0.43-2.app/Contents/Resources/bin/pd'
				: 'pd';

			// spawn pd manually
			pdprocess = spawn(location, ['-noprefs', '-nogui', dir + '/suites/test.net.pd']);
		})
		.on('connect', function(socket){
			this.write('send Gday Pd!;\n');
		})
		.on('data', function(data){
			expect(data).toBeType('string');
			expect(data).toEqual('Gday Pd!;\n');
			this.destroy();
		})
		.on('destroy', function(){
			pdprocess.kill();
		})
		.create();

	});


	it('should dismiss invalid write data', function(expect){
		expect.perform(2);

		var pd = port({
			read: 8015, // [netsend]
			write: 8016, // [netreceive]
			encoding: 'ascii',
			flags: ['-noprefs', '-nogui', dir + '/suites/test.net.pd']
		});

		// [netreceive] socket
		pd.on('connect', function(socket){
			// socket.write(null);
			expect(this.write(null)).toBe(this);
			expect(pd.write(null)).toBe(this);
			pd.destroy();
		});

		pd.create();

	});

});

};

