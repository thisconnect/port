exports.setup = function(Tests){

var host = 'http://localhost:8999',
	planet = require('../../lib/station/modules/planet').Client;


Tests.describe('Planet client', function(it){


	it('should `connect` and then `disconnect`', function(expect){
		var client = planet.connect(host);

		client.on('error', function(error){
			console.log('error', error);
		});

		client.on('connecting', function(){
			expect(client.socket.connected).toBeFalsy();
			expect(client.socket.connecting).toBeTruthy();
		});

		client.on('connect', function(){
			expect(client.socket.connected).toBeTruthy();
			client.disconnect();
		});

		client.on('disconnect', function (){
			expect(client.socket.connected).toBeFalsy();
		});
	});


	it('should receive `update` and `put` data', function(expect){
		var client = planet.connect(host);

		client.on('connect', function(){
			client.emit('update', {
				key: 'foo',
				value: 123
			});
		});

		client.on('state update', function(data){
			expect(data.key).toBe('foo');
			expect(data.value).toBe(123);

			client.emit('put', {
				'foo': 0, 
				'bar': 'baz'
			});
		});

		client.on('put', function(data){
			expect(data.foo).toBe(0);
			expect(data.bar).toBe('baz');
			client.disconnect();
		});

		client.on('delete', function(data){
			console.log('delete', data);
		});

		client.on('error', function(error){
			console.log('error', error);
		});
	});


	it('should `put` and `delete` data then send correct `initial state`', function(expect){
		var client = planet.connect(host);

		client.on('connect', function(){
			client.emit('put', {
				'foo': 1212,
				'bar': 2323
			});
		});

		client.on('put', function(data){
			client.emit('delete', 'foo');
		});

		client.on('delete', function(data){
			expect(data).toBe('foo');
			client.disconnect();

			var other = planet.connect(host);
			other.on('initial state', function(data){
				expect('foo' in data).toBeFalsy();
				expect(data.bar).toBe(2323);

				other.disconnect();
			});
		});

		client.on('error', function(error){
			console.log('error', error);
		});
	});


});

};

