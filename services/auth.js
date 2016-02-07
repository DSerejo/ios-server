var express = require('express');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var util = require('./util.js');
var config = require('./config.js')
var crypto = require('crypto');
var request = require('request');
var passport = require('passport')
var router = express.Router();
router.get('/facebook',passport.authenticate('facebook'));

router.get('/facebook/callback',
    passport.authenticate('facebook',{successRedirect: '/auth/success',failureRedirect: '/auth/error' })
);
router.post('/login',function(req,res,next){
    User.findOne({email:req.body.email},function (err, user) {
        passport.authenticate('local', function(err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.status(500).send('Not registered'); }
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.json({
                    first_name:user.first_name,
                    last_name:user.last_name,
                    name:user.name,
                    email:user.email,
                    picture:user.facebook?user.facebook.picture.data.url:undefined
                });
            });
        })(req, res, next);
    })
})
router.post('/register',function(req,res,next){
    User.findOne({email:req.body.email},function (err, user) {
        if (err) { return next(err); }
        if (user) { return res.status(500).send('Email is being used'); }
        user = new User({
            email: req.body.email,
            password : crypto.createHash('md5').update(config.salt_for_password+req.body.passwd).digest('hex'),
        });
        user.save(function(err) {
            if (err) {
                console.log(err);
                return res.json({error:'error'});
            }
            return res.json({email:user.email});
        });
    })
})
router.post('/facebook/with-token',function(req,res,next){
    request.get(
        'https://graph.facebook.com/me?access_token=' + req.body.passwd,{},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                body = JSON.parse(body);
                if(body.id){
                    console.log(req.body)
                    User.findOne({email:req.body.email},function (err, user) {
                       if(err) return res.json(err);
                        function auth(){
                            passport.authenticate('local', function(err, user, info) {
                                if (err) { return next(err); }
                                if (!user) { return res.status(500).send('Something broke!'); }
                                req.logIn(user, function(err) {
                                    if (err) { return next(err); }
                                    return res.json({
                                        first_name:user.first_name,
                                        last_name:user.last_name,
                                        name:user.name,
                                        email:user.email,
                                        picture:user.facebook.picture.data.url
                                    });
                                });
                            })(req, res, next);
                        }
                       if(!user){
                           user = new User({
                               name: req.body.name,
                               first_name: req.body.first_name,
                               last_name: req.body.last_name,
                               email: req.body.email,
                               provider: 'facebook',
                               accessToken : req.body.passwd,
                               facebook: req.body.profile
                           });
                           user.save(function(err) {
                               if (err) console.log(err);
                               else
                                   auth()
                           });
                       }
                       else{
                           user.accessToken = req.body.passwd;
                           user.name= req.body.name;
                           user.first_name= req.body.first_name;
                           user.last_name= req.body.last_name;
                           user.email= req.body.email;
                           user.provider= 'facebook';
                           user.facebook= req.body.profile;
                           user.save(function(err) {
                               auth()
                           })
                       }

                    });

                }
                else{
                    res.status(500).send('Invalid facebook access token');
                }
            }else{
                res.status(500).send('Invalid facebook access token');
            }
        }
    );



})
router.get('/success',function(req,res,next){
        if(util.loggedIn())
            res.json(req.user)
        else
            res.json({error:'Not logged in'});
    }
);



FacebookStrategy = require('passport-facebook').Strategy
    , LocalStrategy = require('passport-local').Strategy
    , BearerStrategy = require('passport-http-bearer').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    User.findOne({ id: user.id }, function(err, user) {
        done(err, user);
    });
});
passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'passwd'
        },
        function(username, password, done) {
            var a = 0;
            User.findOne({ email: username }, function (err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                if(user.provider=='facebook'){
                    if(user.accessToken==password){
                        return done(null, user);
                    }else{
                        return done(null, false, { message: 'Invalid facebook access token' });
                    }
                }else {
                    if (!user.validPassword(password)) {
                        return done(null, false, {message: 'Incorrect password.'});
                    }
                    return done(null, user);
                }
            });
        }
    )
);

passport.use(new FacebookStrategy({
        clientID: config.facebookAppID,
        clientSecret: config.facebookSecret,
        callbackURL: config.rootUrl + "/auth/facebook/callback",
        profileFields: ['id', 'emails', 'name']

    },
    function(accessToken, refreshToken, profile, done) {
        console.log('oi')
        User.findOne({ id: profile.id }, function(err, user) {

            if (err) { return done(err); }

            if (!user) {
                usr = new User({ email:profile.emails[0].value,provider:'facebook'});
                usr.save(function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        return done(null, usr);
                    }
                });

            }else{
                return done(null, user);
            }


        });
    }
));

module.exports = router;