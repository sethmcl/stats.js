var Watcher = function() {
				
	var socket = io.connect('http://localhost:3333');
	socket.emit('identify', { role: 'WATCHER' });

	socket.on('new-connection', function(data) {
			console.log('new-connection event fired. data = ' + data);
	});

	//socket.emit('message', { data: 'hi cloud server!' });

	this.sendCode = function(code) {
		socket.emit('message', { code: code});
	}
}

