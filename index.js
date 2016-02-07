var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();

app.set('json spaces', 4);


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(session({
  secret: 'testando',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

var db = 'mongodb://root:palmeiras@ds055855.mongolab.com:55855/heroku_tgs0d5pk';
mongoose.connect(db);
require('./models/user');

require('./services/config.js');

var auth = require('./services/auth');
app.use('/auth',auth);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


