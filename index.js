var express = require('express');
var mongoose = require('mongoose');
var app = express();


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

var db = 'mongodb://root:palmeiras@ds055855.mongolab.com:55855/heroku_tgs0d5pk';
mongoose.connect(db);
require('./models/user');

var auth = require('./services/auth');
app.use('/auth',auth);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


