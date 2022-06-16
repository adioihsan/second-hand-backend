const passport = require('passport')
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const { User } = require('../models')

/* Passport JWT Options */
const options = {
    // Untuk mengekstrak JWT dari request, dan mengambil token-nya dari header yang bernama Authorization Bearer
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
}

passport.use(new JwtStrategy(options, async (payload, done) => {
    // payload adalah hasil terjemahan JWT, sesuai dengan apa yang kita masukkan di parameter pertama dari jwt.sign

    const user = await User.findByPk(payload.id) // Cari user yang datanya bakal dikirim ke middleware auth.js
    if(!user) {
        return done(null, false)
    }
    return done(null, user)
}))

module.exports = passport
