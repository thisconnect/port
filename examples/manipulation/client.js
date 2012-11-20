var canvas = document.getElementById('osci'),
	context = canvas.getContext('2d'),
	blockWidth = canvas.width / 128;

context.fillStyle = '#000';
context.fillRect(0, 0, canvas.width, canvas.height);

var socket = io.connect();

socket.on('connect', function(){
	// console.log('connected');
});

var down = false;

window.addEventListener('mouseup', function(e){ down = false; });

canvas.addEventListener('mousedown', function(e){ down = true; });

canvas.addEventListener('mousemove', function(e){
	if (down && socket.socket.connected){
		var x = parseInt(e.clientX / blockWidth) - 1,
			y = (e.clientY / (canvas.height * -0.5)) + 1;
		
		//console.log(x, y);
		socket.emit('data', x, y);
		
		context.fillStyle = '#000';
		context.fillRect(x * blockWidth, 0, 10, canvas.height);

		context.fillStyle = '#fc0';
		context.fillRect(x * blockWidth, canvas.height * 0.5, 10, -y * canvas.height * 0.5);
	}
});

