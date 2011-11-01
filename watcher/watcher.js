var Watcher = function(config) {
	Events.call(this);
	var self = this;	
	var config = config || {};
	var socket = io.connect('http://localhost:3333');
	var initialized = false;

	socket.emit('identify', { role: 'WATCHER' });
	socket.emit('request-history', { startTime: 0 });
	socket.on('history', init);
	socket.on('reporter-action', onAction);
	socket.on('reporter-connected', onReporterConnected);
	socket.on('reporter-disconnected', onReporterDisconnected);

	function init(data) {
		if(initialized) return;
		initialized = true;
		console.log('Received history: ' + data.result.length);
		data.type = 'history';
	}

	function onAction(data) {
		
		data.type = 'action';
		self.fire('reporter-action', data);
	}

	function onReporterConnected(e) {
		self.fire('reporter-connected', e);
	}

	function onReporterDisconnected(e) {
		self.fire('reporter-disconnected', e);
	}
}

function Events() {
	var self = this;
	var handlers = {};
	
	this.fire = function(type, args) {
		var eventHandlers;
		var index;
	
		if(typeof type === 'object' && typeof type.type !== 'string') {
			throw Error('Event type not specified');
		}

		if(typeof args !== 'object') {
			args = { data: args };
		}

		if(typeof type === 'object' && typeof type.type === 'string') {
			args = type;
			type = type.type;
		} else {
			args.type = type;
		}

		eventHandlers = handlers[type];

		if(!eventHandlers) return false;

		index = eventHandlers.length;

		while(index--) {
			eventHandlers[index].call(self, args);
		}

		return true;
	};

	this.on = function(type, fn) {
		if(typeof type !== 'string') {
			throw Error('Expected string for event type, found ' + typeof type);
		}

		if(typeof fn !== 'function') {
			throw Error('Expected function, found ' + typeof fn);
		}

		if(!handlers[type]) {
				handlers[type] = [];
		}

		if(handlers[type].indexOf(fn) === -1) {
			handlers[type].push(fn);
		}

		return fn;
	};

	this.off = function(type, fn) {
		var eventHandlers;

		if(typeof type !== 'string') {
			throw Error('Expected string for event type, found ' + typeof type);
		}

		if(typeof fn !== 'function') {
			throw Error('Expected function, found ' + typeof fn);
		}

		eventHandlers = handlers[type];

		if(eventHandlers) {
			for(var i = eventHandlers.length - 1; i >= 0; i--) {
				if(eventHandlers[i] === fn) {
					eventHandlers.splice(i, 1);
					return true;
				}
			}
		}

		return false;
	};
}
