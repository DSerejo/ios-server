var mongoose = require('mongoose');
var config = require('../services/config.js');
var crypto = require('crypto');
var userSchema = new mongoose.Schema({
    password: { type: String, require:true },
    provider:String,
    first_name:String,
    name:String,
    last_name:String,
    accessToken:String,
    email:{type: String,require:true,unique:true},
    facebook: mongoose.Schema.Types.Mixed

});
userSchema.methods.validPassword = function(password,cb){
    var md5Password = crypto.createHash('md5').update(config.salt_for_password+password).digest('hex');
    return this.password===md5Password
}
mongoose.model('User', userSchema);