// the client script

var canvas = document.getElementById('osci'),
	context = canvas.getContext('2d');

context.fillStyle = '#000';
context.fillRect(0, 0, canvas.width, canvas.height);

var socket = io.connect();

var blockWidth = canvas.width / 128,
	touching = false;

function change(e){
	if (touching && socket.socket.connected){
		var clientX = e.clientX || e.changedTouches[0].pageX,
			clientY = e.clientY || e.changedTouches[0].pageY,
			x = parseInt(clientX / blockWidth) - 1,
			y = 1 - (clientY / canvas.height);

		// send data to the server
		socket.emit('data', x, y);

		// draw the touched block
		context.fillStyle = '#000';
		context.fillRect(x * blockWidth, 0, blockWidth, canvas.height);
		context.fillStyle = '#fc0';
		context.fillRect(x * blockWidth, clientY, blockWidth, canvas.height);
	}
}

function stop(){ touching = false; }

// mouse events
window.addEventListener('mouseup', stop);
canvas.addEventListener('mousedown', function(e){
	touching = true;
	change(e);
});
canvas.addEventListener('mousemove', change);


// mobile touch events
canvas.addEventListener('touchstart', function(e){
	e.preventDefault();
	touching = true;
	change(e);
}, false);

canvas.addEventListener('touchmove', change, false);
canvas.addEventListener('touchend', stop, false);
canvas.addEventListener('touchcancel', stop, false); 

