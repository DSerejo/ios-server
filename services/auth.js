var express = require('express');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var config = require('./config.js');
var passport = require('passport')
    , FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
        clientID: '1012473728820464',
        clientSecret: '3ca61a30dcd8a3eb780a6e618cc606ae',
        callbackURL: config.rootUrl + "/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOrCreate('', function(err, user) {
            if (err) { return done(err); }
            done(null, user);
        });
    }
));
var router = express.Router();
router.get('/facebook',passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', function(){
        console.log(arguments);
    })
);

module.exports = router;