var io = require('socket.io-client');

exports.Client = {

	connect: function(host){
		return io.connect(host || '//localhost:8999', {
			'force new connection': 1
			/*,
			'reconnect': true,
			'reconnection delay': 500,
			'max reconnection attempts': 10*/
		});
	},

	/* send: function(data){
		this.$socket.emit('update', {
			key: 'foo',
			value: 123
		});
	}, */

	parse: function(values){
		for (var key in values){
			// console.log(i.replace(/\:/, ' '), payload[i]);
			this.onReceive(key, values[key]);
		}
	}

};
