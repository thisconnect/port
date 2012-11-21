var canvas = document.getElementById('osci'),
	context = canvas.getContext('2d'),
	blockWidth = canvas.width / 128;

context.fillStyle = '#000';
context.fillRect(0, 0, canvas.width, canvas.height);

var socket = io.connect();

socket.on('connect', function(){
	// console.log('connected');
});


function change(e){
	if (down && socket.socket.connected){
		var x = parseInt(e.clientX / blockWidth) - 1,
			y = 1 - (e.clientY / canvas.height);
		
		console.log(x, y);

		socket.emit('data', x, y);
		
		context.fillStyle = '#000';
		context.fillRect(x * blockWidth, 0, blockWidth, canvas.height);

		context.fillStyle = '#fc0';
		context.fillRect(x * blockWidth, e.clientY, blockWidth, canvas.height);
	}
}

var down = false;

window.addEventListener('mouseup', function(){ down = false; });

canvas.addEventListener('mousedown', function(e){
	down = true;
	change(e);
});

canvas.addEventListener('mousemove', change);

