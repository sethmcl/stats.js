var watcher
		,colors
		,colorIdx
    ,reporters
    ,canvas
    ,ctx;

$(document).ready(function() {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
		colors = ['red', 'green', 'blue', 'pink'];
    colorIdx = 0;
    reporters = {};

		watcher = new Watcher();
		watcher.on('reporter-action', onWatcherAction)
		watcher.on('reporter-connected', onReporterConnected);
		watcher.on('reporter-disconnected', onReporterDisconnected);

    draw();
});

function draw() {
  var reporter;
  var coord;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for(var r in reporters) {
    if(!reporters.hasOwnProperty(r)) continue;
    reporter = reporters[r];

    for(var i = 0, len = reporter.coords.length; i < len; i++) {
      coord = reporter.coords[i];
      ctx.fillStyle = reporter.color;
      ctx.fillRect(coord.x - 10, coord.y - 10, 20, 20);
    }
  } 
  setTimeout(draw, 5);
}

function onWatcherAction(e) {
	var code = e.code,
			reporterID = e.reporter,
      reporter = reporters[reporterID];

	if(!code || !reporter) return;

	switch(code) {
		case 'mouse-move':
			reporter.moveMouse(e.payload.x, e.payload.y);
			break;
	}	
}

function onReporterConnected(e) {
	console.log('reporter connected: ' + e.reporter);
  reporters[e.reporter] = new Reporter();

}

function onReporterDisconnected(e) {
  console.log('reporter disconnected: ' + e.reporter);	
  delete reporters[e.reporter];
}

function nextColor() {
  return colors[colorIdx++];
  if(colorIdx >= colors.length) colorIdx = 0;
}

function Reporter() {
  this.color = nextColor();
  this.coords = [];  

  this.moveMouse = function(x, y) {
    console.log('mouse moved');
    this.coords = [];
    this.coords.push({x: x, y: y});
  }
}
