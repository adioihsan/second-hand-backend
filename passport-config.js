/** @format */

const { user } = require('../app/models');
const bcrypt = require('bcrypt');
const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;

passport.use(
  new LocalStrategy({ usernameField: 'username', passwordField: 'password' }, async function (username, password, done) {
    try {
      const user = await user.findOne({ where: { username: username } });
      if (!user) {
        return done(null, false, { message: 'User name wrong.' });
      }
      const passVal = await bcrypt.compare(password, user.password);
      if (!passVal) {
        return done(null, false, { message: 'Password wrong.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  user.findByPk(id).then(function (user) {
    done(null, user);
  });
});