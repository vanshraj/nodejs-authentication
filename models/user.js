var mongoose = require('mongoose');
var passwordHash = require('password-hash');
mongoose.connect('mongodb://localhost/nodeauth');
var db = mongoose.connection;

// User Schema
var UserSchema = mongoose.Schema({
	username: {type: String, index:true},
	password: {type: String},
	email: {type: String},
	profileimage: {type:String},
	name: {type: String}
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser =function( newUser, callback){
	var hash = passwordHash.generate(newUser.password);
	newUser.password = hash;
	newUser.save(callback);
}

module.exports.getUserByUsername = function( username, callback){
	var query = { username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function( id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function( candidatePassword, hash, callback){
	var isMatch = passwordHash.verify(candidatePassword, hash);
	callback(null, isMatch);
}