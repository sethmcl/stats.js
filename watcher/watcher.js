var Watcher = function() {
				
	var socket = io.connect('http://localhost:3333');
	var initialized = false;

	socket.emit('identify', { role: 'WATCHER' });
	socket.emit('request-history', { startTime: 0 });

	socket.on('history', init);
	socket.on('new-action', onAction);

	function init(data) {
		if(initialized) return;
		initialized = true;
		console.log('Received history: ' + data.result.length);
	}

	function onAction(data) {
		console.log('a user just ' + data.code);
	}
}

