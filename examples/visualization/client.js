var canvas = document.getElementById('osci'),
	context = canvas.getContext('2d'),
	block = 0;

context.fillStyle = '#000';
context.fillRect(0, 0, 1024, 480); // canvas.width canvas.height

var socket = io.connect();

socket.on('connect', function(){

	socket.on('data', function(data){
		var i, l = data.length;
		context.fillStyle = '#000';
		context.fillRect(block * 256, 0, 256, 480);
		
		context.fillStyle = '#0f0';
		for (i = 0; i < l; i += 1){
			context.fillRect(i + (block * 256), parseInt(data[i] * 240) + 240, 1, 1);
		}
		block = (block + 1) % 4;
	});

});
