var Reporter = function() {
	var uuids;
	var sessionData;
	var localData;
	var storageKey = 'stats-js';
	var socket = io.connect('http://localhost:3333');
	socket.emit('identify', { role: 'REPORTER' });
	socket.emit('request-uuid');

	// Listen
	socket.on('uuid', init);

	// Initialize everything
	function init(uuid) {
		loadUuids(uuid);
	}

	// Load UUIDs (session and static)
	function loadUuids(uuid) {
		if(window.localStorage) {
			try {
				localData = JSON.parse(window.localStorage[storageKey]);
			} catch(e) {
				trace('Unable to load local data for stats-js');
				localData = { uuid: 'local-' + uuid };
				persistData();
			}
		} else {
			localData = { uuid: 'local-' + uuid };
		}

		if(window.sessionStorage) {
			try {
				sessionData = JSON.parse(window.sessionStorage[storageKey]);
			} catch(e) {
				trace('Unable to load session data for stats-js');
				sessionData = { uuid: 'session-' + uuid };
				persistData();
			}
		} else {
			sessionData = { uuid: 'session-' + uuid };
		}

		uuids = { load: 'load-' + uuid, session: sessionData.uuid, local: localData.uuid };
	}

	// Persist session and local storage
	function persistData() {
		try {
			window.localStorage[storageKey] = JSON.stringify(localData);
			window.sessionStorage[storageKey] = JSON.stringify(sessionData);
		} catch(e) {
			trace('Unable to persist data');
		}
	}

	// Send an action code to the server
	function send(code, payload) {
		socket.emit('reporter-action', { code: code, uuids: uuids, payload: payload });
	}

	// Trace - used for debugging
	function trace(m) {
		console.log(m);
	}

	// Publicize API
	this.send = send;
}

