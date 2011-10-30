var mongoose = require('mongoose');

var Schema 		=	mongoose.Schema,
		ObjectId	=	Schema.ObjectId;

var actionSchema	=	new Schema({
	id:						{ type: ObjectId },
	code:					{ type: String },
	timestamp:		{ type: Number, default: function() { return new Date().getTime(); }},
	payload:			{ type: Schema.Types.Mixed },
	ip:						{ type: String },
	ua:						{ type: String },
	lang:					{ type: String },
	loadGuid:			{ type: String },
	sessionGuid:	{ type: String },
	localGuid:	 	{ type: String }
});

exports.Action = mongoose.model('Action', actionSchema); 
