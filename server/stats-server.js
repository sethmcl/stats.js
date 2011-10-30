
// Modules
var io 			= require('socket.io'),
		util 		= require('util'),
		uuid		=	require('node-uuid');

// Privates 
var defaultPort 	= 3333,
		port 					= parseInt(process.argv[2]) || defaultPort,
		reporters			= [],
		watchers			= [],
		reporterCode	= 'REPORTER',
		watcherCode		=	'WATCHER',

		errorCodes 		= {
			alreadyIdentified: 1000
		};

init();

/**
 * Start the socket.io server
 */
function init() {
	log('Starting server on port ' + port);
	io = io.listen(port);

	io.sockets.on('connection', function(socket) {
		// GLOBAL: io.sockets.emit('new-connection', 'user connected');
		socket.on('identify', socketFn(socket, identifyClient)); 
		socket.on('disconnect', socketFn(socket, removeClient));
		socket.on('reporter-action', socketFn(socket, logAction));
		socket.on('request-uuid', socketFn(socket, provideUuid));
	});
}

// Get a function wrapped for a socket
function socketFn(socket, fn) {
	return function(data) {
		var data = data || {};
		fn(socket, data);
	};
}

// Provide a UUID to a socket
function provideUuid(socket, data) {
	socket.emit('uuid', uuid());
}

// Log an action from a reporter
function logAction(socket, data) {
	var code = data.code;

	if(code) {
		log('Received code: ' + code + ' from reporter');
	}
}

// Client has identified itself as either a reporter or watcher
function identifyClient(socket, data) {

	// Do not let client re-identify self
	if(reporters.indexOf(socket) !== -1 || watchers.indexOf(socket) !== -1) {
		sendError(socket, errorCodes.alreadyIdentified);
		return;
	}

	if(data.role === reporterCode) {
		reporters.push(socket);
		log('Reporter identified.', 10);
	} else if(data.role === watcherCode) {
		watchers.push(socket);
		log('Watcher identified', 10);
	}
}

// Send an error to client
function sendError(socket, errorCode) {
	log('Sending error ' + errorCode + ' to client');
	socket.emit('error', { code: errorCode });
}

// Remove a client - disconnects the client
function removeClient(socket) {
	var index;

	if((index = reporters.indexOf(socket)) !== -1) {
		reporters.splice(index, 1);
		log('Reporter disconnected', 10);
	} else if((index = watchers.indexOf(socket)) !== -1) {
		watchers.splice(index, 1);
		log('Watcher disconnected', 10);
	}
}

// Log a helpful message!
function log(message, level) {
	console.log('STATS-LOG:\t' + message);
}

