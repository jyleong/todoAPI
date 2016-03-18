var cryptojs = require('crypto-js');

module.exports = function(db){
	return {
		requireAuthentication: function(req,res,next){
			// pull the token nfrom request header
			var token = req.get('Auth') || "";
			db.token.findOne({
				where : {
					tokenHash: cryptojs.MD5(token).toString()
				}
			}).then(function(tokenInstance) {
				if (!tokenInstance) {
					throw new Error();
				}
				req.token = tokenInstance;
				return db.user.findByToken(token)
			}).then(function(user) {
				console.log("found user")
				req.user = user;
				console.log(user);
				next();
			}).catch(function(e) {

				res.status(401).json(e);
			});
		}
	};
};