var reporter;

$(document).ready(function() {
		$('#join').click(clickJoin);
		$('#sign-in').click(clickSignIn);
		$('#sign-out').click(clickSignOut);

		reporter = new Reporter();

		window.addEventListener('mousemove', function(e) {
			reporter.send('mouse-move', { x: e.x, y: e.y });
		});
});

function clickJoin() {
	console.log('clicked on join button');
	reporter.send('clicked-join');
}

function clickSignIn() {
	console.log('clicked on sign-in button');
	reporter.send('clicked-signin', { color: 'red' });
}

function clickSignOut() {
	console.log('clicked on sign-out button');
	reporter.send('clicked-signout');
}

