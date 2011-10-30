
// Modules
var io 				= require('socket.io'),
		util 			= require('util'),
		uuid			=	require('node-uuid'),
		mongoose	=	require('mongoose'),
		models		=	require('./models');

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
	// connect to database
	mongoose.connect('mongodb://localhost/msu');

	log('Starting server on port ' + port);
	io = io.listen(port);

	io.sockets.on('connection', function(socket) {
		// GLOBAL: io.sockets.emit('new-connection', 'user connected');
		socket.on('identify', socketFn(socket, identifyClient)); 
		socket.on('disconnect', socketFn(socket, removeClient));
		socket.on('reporter-action', socketFn(socket, logAction));
		socket.on('request-uuid', socketFn(socket, provideUuid));
		socket.on('request-history', socketFn(socket, sendHistory));
	});
}

// Get a function wrapped for a socket
function socketFn(socket, fn) {
	return function(data) {
		var data = data || {};
		fn(socket, data);
	};
}

// Send action history, where time is greater than data.startTime
function sendHistory(socket, data) {
	var startTime = parseInt(data.startTime) || 0;
	var result = { length: 0 };
	models.Action.find({ timestamp: {$gte:startTime} }, function(err, docs) {
		docs.forEach(function(doc) {
			if(!result[doc.loadGuid]) {
				result[doc.loadGuid] = [];
				result.length++;
			}

			result[doc.loadGuid].push(doc);
		});

		socket.emit('history', { result: result });
	});
}

// Provide a UUID to a socket
function provideUuid(socket, data) {
	socket.emit('uuid', uuid());
}

// Log an action from a reporter
function logAction(socket, data) {
	var code = data.code;
	var payload = (typeof data.payload === 'object') ? data.payload : {};
	var action = new models.Action();

	if(code) {
		log('Received code: ' + code + ' from reporter');
		action.code = code;
		action.payload = payload;
		action.markModified( 'payload' );
		
		io.sockets.emit('new-action', action);
		action.save(function(error) {
			if(!error) log('Saved new entry in database');
		});
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

