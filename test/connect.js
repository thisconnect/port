var expect = require('expect.js');

var port = require('../');

describe('Port connection', function(){


	it('should expose 2 sockets for [netsend] and [netreceive]', function(done){

		port({
			read: 8005, // [netsend]
			write: 8006, // [netreceive]
			flags: ['-noprefs', '-nogui', __dirname + '/test-connection.pd']
		})
		.on('connection', function(socket){
			expect(socket).to.be.an('object');
		})
		.on('connect', function(socket){
			expect(socket).to.be.an('object');
			this.destroy();
		})
		.on('destroy', function(){
			expect(this).to.be.a(port);
			done();
		})
		.create();

	});


	it('should echo messages sent to Pd', function(done){

		var pd = port({
			read: 8015, // [netsend]
			write: 8016, // [netreceive]
			encoding: 'ascii',
			flags: ['-noprefs', '-nogui', __dirname + '/test-net.pd']
		});

		// [netreceive] socket
		pd.on('connect', function(socket){
			expect(socket.write).to.be.a('function');
			expect(this.write).to.be.a('function');
			expect(pd.write).to.be.a('function');
			// sends data to [netreceive]
			socket.write('send Hello Pd!;\n');
		});

		// receives data from [netsend]
		pd.on('data', function(data){
			expect(data).to.be.a('string');
			expect(data).to.be('Hello Pd!;\n');
			pd.destroy();
			done();
		});

		pd.create();

	});


	it('should pass the raw buffer object if no encoding is specified', function(done){

		var pd = port({
			read: 8015, // [netsend]
			write: 8016, // [netreceive]
			flags: ['-noprefs', '-nogui', __dirname + '/test-net.pd']
		});

		pd.on('connect', function(socket){
			// sends data to [netreceive]
			socket.write('send Hello Pd!;\n');
		});

		// receives data from [netsend]
		pd.on('data', function(data){
			expect(data).to.be.an('object');
			expect(data).to.have.property('length');
			expect(data.toString()).to.be('Hello Pd!;\n');
			pd.destroy();
			done();
		});

		pd.create();

	});


	it('should connect to two Pd instances in parallel', function(done){

		var one = port({
			read: 8005, // [netsend]
			write: 8006, // [netreceive]
			flags: ['-noprefs', '-nogui', __dirname + '/test-connection.pd']
		});

		var two = port({
			read: 8015, // [netsend]
			write: 8016, // [netreceive]
			encoding: 'ascii',
			flags: ['-noprefs', '-nogui', __dirname + '/test-net.pd']
		});

		two.on('data', function(data){
			expect(data).to.be.a('string');
			expect(data.indexOf('Hello Pd!;\n')).to.be.above(-1);
			one.destroy();
			two.destroy();
		});

		two.on('connect', function(socket){
			socket.write('send Hello Pd!;\n');
		});

		one.on('connect', function(socket){
			expect(socket).to.be.an('object');
			two.create();
		});

		two.on('destroy', function(){
			done();
		});
       
		one.create();

	});


	it('should establish a oneway sending connection', function(done){
		
		var result = '';

		var pd = port({
			write: 8046, // [netreceive]
			flags: ['-noprefs', '-stderr', '-nogui', __dirname + '/test-netreceive.pd']
		});

		pd.on('connect', function(){
			pd.write('hi Pd!;\n');
		});

		pd.on('stderr', function(buffer){
			buffer = buffer.toString();
			if (buffer == 'ready: bang\n') return pd.connect();

			result += buffer;
			expect('print: hi Pd!\n'.indexOf(buffer)).to.be.above(-1);
			if (result == 'print: hi Pd!\n'){
				pd.destroy();
				done();
			}
		});

		pd.create();

	});


	it('should establish a oneway receiving connection', function(done){

		var pd = port({
			read: 8025, // [netsend]
			encoding: 'ascii',
			flags: ['-noprefs', '-nogui', __dirname + '/test-netsend.pd']
		});

		pd.on('data', function(data){
			expect(data).to.be.a('string');
			expect(data.substr(-2)).to.be(';\n');
			expect(data).to.be('100;\n');
			expect(parseInt(data.slice(0, -2))).to.be.a('number');
			pd.destroy();
			done();
		});

		pd.create();

	});


	it('should receive data from 2 [netsend] objects', function(done){

		var result = 0;

		port({
			read: 8035, // [netsend]
			encoding: 'ascii',
			max: 2,
			flags: ['-noprefs', '-nogui', __dirname + '/test-netsends.pd']
		})
		.on('data', function(data){
			data = parseInt(data.slice(0, -2));
			expect(data).to.be.a('number');
			result += data;
			if (result == 3) this.destroy();
		})
		.on('destroy', function(){
			expect(result).to.be(3);
			done();
		})
		.create();

	});


	it('should limit the incoming connections to 1', function(done){

		var result = 'create, ';

		var pd = port({
			read: 8035, // [netsend]
			//encoding: 'ascii',
			max: 1,
			flags: ['-noprefs', '-stderr', '-nogui', __dirname + '/test-netsends.pd']
		})
		.on('listening', function(){
			result += 'listen, ';
		})
		.on('stderr', function(buffer){
			result += 'stderr, ';
			//console.log(buffer.toString());
		})
		.on('connection', function(socket){
			result += 'connection, ';
			setTimeout(this.destroy.bind(this), 10);
		})
		.on('data', function(data){
			data = data.toString();
			result += 'data: ' + data + ', ';
			expect(data).to.be.a('string');
			expect(data).to.be('1;\n');
		})
		.on('destroy', function(){
			result += 'destroy, done!';
		})
		.on('exit', function(){
			expect(result.match(/create/g)).to.have.length(1);
			expect(result.match(/listen/g)).to.have.length(1);
			expect(result.match(/stderr/g)).to.have.length(2);
			expect(result.match(/connection/g)).to.have.length(1);
			expect(result.match(/data/g)).to.have.length(1);
			done();
		})
		.create();

	});


	it('should create and destroy the same port instance 16 times in a row', function(done){

		var i = 1;

		var pd = port({
			read: 8025, // [netsend]
			flags: ['-noprefs', '-nogui', __dirname + '/test-netsend.pd']
		});

		// pd.on('error', function(error){});
		// pd.on('close', function(){});
		// pd.on('stderr', function(buffer){});
		// pd.on('connection', function(){});

		pd.on('data', function(data){
			expect(data.toString()).to.be('100;\n');
			pd.destroy();
		});

		pd.on('destroy', function(){
			if (i++ < 16) pd.create();
			else done();
		});

		pd.create();

	});


	it('should allow to connect to a manually spawned Pd process', function(done){

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
				? '/Applications/Pd-0.45-4-64bit.app/Contents/Resources/bin/pd'
				: 'pd';

			// spawn pd manually
			pdprocess = spawn(location, ['-noprefs', '-nogui', __dirname + '/test-net.pd']);
		})
		.on('connect', function(socket){
			this.write('send Gday Pd!;\n');
		})
		.on('data', function(data){
			expect(data).to.be.a('string');
			expect(data).to.be('Gday Pd!;\n');
			this.destroy();
		})
		.on('destroy', function(){
			pdprocess.kill();
			done();
		})
		.create();

	});


	it('should dismiss invalid write data', function(done){

		var pd = port({
			read: 8015, // [netsend]
			write: 8016, // [netreceive]
			encoding: 'ascii',
			flags: ['-noprefs', '-nogui', __dirname + '/test-net.pd']
		});

		// [netreceive] socket
		pd.on('connect', function(socket){
			expect(this.write(null)).to.be(this);
			expect(pd.write(null)).to.be(this);
			pd.destroy();
			done();
		});

		pd.create();

	});

});
