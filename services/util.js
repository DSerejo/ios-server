exports.loggedIn = function(req,res,next){
    return req.user?true:false;
}
