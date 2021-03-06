var express = require('express'),
	app = express(),
	path = require('path'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'), 
	config = require('./config/config.js'),
	connectMongo = require('connect-mongo')(session),
	mongoose = require('mongoose').connect(config.dbURL),
	passport = require('passport'),
	FBStrategy = require('passport-facebook').Strategy,
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
	rooms = [],
	todocontroller = require('./controller/controller.js')

const translate = require('google-translate-api');
	
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({secret:'I am lulululu', resave:true, saveUninitialized:true}));


var env = process.env.NODE_ENV || 'development';


app.use(passport.initialize());
app.use(passport.session());

var user = new mongoose.Schema({
  profileID:String,
  fullname:String,
  profilePic:String
})

var userModel = mongoose.model('user', user);

passport.serializeUser(function(user, done){
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  userModel.findById(id, function(err, user) {
    done(err, user);
  })
});

require('./auth/passportauthfb.js')(passport, FBStrategy, config, mongoose,userModel);
require('./auth/passportauthgoogle.js')(passport, GoogleStrategy, config, mongoose,userModel);
require('./routes/routes.js')(express, app, passport, config, rooms);
/*
app.listen(9000, function() {
	console.log('ChatBox is working on port 9000');
	console.log('Current mode is '+ env);
})*/
app.set('port', process.env.PORT || 9000);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
require('./socket/socket.js')(io, rooms);

app.get('/translate/:lan',function(req,response) {
  translate(req.body.data, {to: req.params.lan}).then(res => {
    res.render('room',)
    //=> I speak English
    console.log(res.from.language.iso);
    //=> nl
  }).catch(err => {
    console.error(err);
  });
});


server.listen(app.get('port'), function() {
	console.log('ChatBox is working on ' + app.get('port')); 
});