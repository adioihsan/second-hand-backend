const passport = require('../libs/passport');

const auth = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err || user==null || user==false) { 
            return next(info) 
        } else {
            req.user = user;
            return next();
        };
    })(req, res, next);
};

module.exports = auth;