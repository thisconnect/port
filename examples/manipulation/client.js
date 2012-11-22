

var canvas = document.getElementById('osci'),
	context = canvas.getContext('2d');

context.fillStyle = '#000';
context.fillRect(0, 0, canvas.width, canvas.height);


var socket = io.connect();

socket.on('connect', function(){
	// console.log('connected');
});

var blockWidth = canvas.width / 128;

function change(e){
	if (down && socket.socket.connected){
		var clientX = e.clientX || e.changedTouches[0].pageX,
			clientY = e.clientY || e.changedTouches[0].pageY,
			x = parseInt(clientX / blockWidth) - 1,
			y = 1 - (clientY / canvas.height);

		socket.emit('data', x, y);
		
		context.fillStyle = '#000';
		context.fillRect(x * blockWidth, 0, blockWidth, canvas.height);
		context.fillStyle = '#fc0';
		context.fillRect(x * blockWidth, clientY, blockWidth, canvas.height);
	}
}

function stop(){ down = false; }

var down = false;

window.addEventListener('mouseup', stop);

canvas.addEventListener('mousedown', function(e){
	down = true;
	change(e);
});

canvas.addEventListener('mousemove', change);


// touch stuff for your mobile

canvas.addEventListener('touchstart', function(e){
	e.preventDefault();
	down = true;
	change(e);
}, false);
canvas.addEventListener('touchmove', change, false);
canvas.addEventListener('touchend', stop, false);
canvas.addEventListener('touchcancel', stop, false); 


