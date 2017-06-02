var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './uploads' });
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{ title:'Register' });
});

router.get('/login', function(req, res, next) {
  res.render('login',{ title:'Login' });
});

router.post('/register',upload.single('profileimage'),  function(req, res, next) {

	//file info
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Check for image field
	if(req.file){
		console.log("uploading file...");
		var profileImageOriginalName = req.file.originalname;
		var profileImageName = req.file.filename;
		console.log(profileImageName + ' uploaded.');
		var profileImageMime = req.file.mimetype;
		var profileImagePath = req.file.path;
		var profileImageExt = req.file.extension;
		var profileImageSize = req.file.size;
	} else {
		console.log('found no image');
		var profileImageName = 'noimage.png'
	}

	// for validation
	req.checkBody('name','Name Field Required').notEmpty();
	req.checkBody('email','Email Field Required').notEmpty();
	req.checkBody('email','Email not valid').isEmail();
	req.checkBody('username','Username Field Required').notEmpty();
	req.checkBody('password','Password Field Required').notEmpty();
	req.checkBody('password2','Passwords do not match').equals(req.body.password);
	
	//check for errors
	var errors = req.validationErrors();
	
	User.getUserByUsername(username,function(err,user){
		if(err) throw err;

		if(user){
			var errors=[];
			errors.push({ param: 'username', msg: 'Username already exists', value: '' });
			console.log(errors);
		}

		if(errors){
		res.render('register',{
			title:'Register',
			errors: errors,
			name: name,
			email: email,
			username: username,
			password: password,
			password2: password2
		});
		}	
		 else
		{
			var newUser = new User({
				name: name,
				email: email,
				username: username,
				password: password,
				profileimage: profileImageName
			});
			//create user
			User.createUser(newUser, function(err, user){
				if(err) throw err;
				console.log(user);
			});

			//Success message
			req.flash('success','You are now registered and may log in');
			res.location('/users/login');
			res.redirect('/users/login');
		}
	});	
});

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function (err, user) {
		done(err, user);
	});
});
//passport local strategy
passport.use( new LocalStrategy(
	function(username, password, done){
		User.getUserByUsername(username, function(err, user){
			if(err) throw err;
			if(!user){
				console.log('Unknown User');
				return done(null, false, {message: 'Unknown User'});
			}
			User.comparePassword(password, user.password, function(err, isMatch){
				if(err) throw err;
				if(isMatch){
					return done(null, user);
				}else{
					console.log('Invalid Password');
					return done(null, false, {message: 'Invalid Password'});
				}
			});
		});
	}
));

router.post('/login', passport.authenticate('local',{failureRedirect:'/users/login', failureFlash:'Invalid Username or Password'}),function(req,res){
	console.log('Authentication Successful');
	req.flash('success','You are logged in');
	res.redirect('/');
});

router.get('/logout',function(req,res){
	req.logout();
	req.flash('success','You have logged out');
	res.redirect('/users/login');
});

module.exports = router;
