const passport = require('../libs/passport');

const auth = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err || user==null || user==false) { 
            return next(info) 
        } else {
            req.user = user; // Kalau berhasil datanya dimasukkin ke req.user. dan nanti dipakai di dalam controller kalau membutuhkan data user pada JWT
            return next();
        };
    })(req, res, next);
};

module.exports = auth;