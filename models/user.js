var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    password:String,
    email:{ type: String, unique: true }
});

mongoose.model('User', userSchema);