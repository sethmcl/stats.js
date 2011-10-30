var data = require('./aws_dump').data,
		mongoose	=	require('mongoose'),
		models		=	require('./models');

var action;
var value;
var successCount = 0;
var errorCount = 0;
mongoose.connect('mongodb://localhost/msu');

data.forEach(function(wrapperA) {
	wrapperA.forEach(function(wrapperB) {
		var action = new models.Action();
		wrapperB.Attribute.forEach(function(attr) {
			value = attr.Value;

			switch(attr.Name) {
				case 'c':
						action.code = value;
						break;
				case 'g':
						action.loadGuid = value;
						break;
				case 'ip':
						action.ip = value;
						break;
				case 'ln':
						action.lang = value;
						break;
				case 't':
						action.timestamp = value;
						break;
				case 'u':
						action.ua = value;
						break;
			}
		});
		action.save(function(error) {
			if(!error) { 
				successCount++;
			} else {
				errorCount++;
			}
		});
	});
});

console.log('Operation complete');

