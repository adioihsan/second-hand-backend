/** @format */

const { User, UserDetail } = require('../models');
const response = require('../../utils/formatResponse');
const emailTransporter = require('../libs/email.js');

module.exports = {
  // POST /register
  postRegister: async (req, res) => {
    try {
      const { name, email, password } = req.body
      const users = await User.register({ email, password })
      if (users) { 
        const userDetail = await UserDetail.create({
          name: name,
          user_id: users.id 
        })
        console.log(userDetail)
        // TODO : ADD OTP TO VERIFY EMAIL
        // const otp = await Otp.create({})
        // console.log(otp)
        // TODO : ADD Feature Verify EMAIL
        if (userDetail) {
          const mailOptions = {
            from: 'Second Hand App',
            to: email,
            subject: 'Verify your email',
            text: `Welcome to Second Hand App,`,
            html: `<!doctype html>
                    <html>
                    <head>
                        <meta name="viewport" content="width=device-width">
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                        <title>Simple Transactional Email</title>
                    </head>
                    <body>
                        <p>Welcome to Second Hand App </p>
                    </body>
                    </html>`
          }
          emailTransporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err)
                return response(res, 500, false, err.message, null)
            } else {
                console.log(info)
            }
          })
          return response(res, 200, true, 'Register Success', null)
        }
        return response(res, 500, false, 'Register Failed', null)
      }
    } catch (err) {
      console.log(err);
      if (err.name === 'SequelizeUniqueConstraintError') {
        return response(res, 400, false, 'Email already exists', null)
      } else if (err.name === 'SequelizeValidationError') {
        return response(res, 400, false, err.message, null)
      } else {
        return response(res, 500, false, 'Internal Server Error')
      }
    }
  },
  // POST /login
  postLogin: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!(email && password)) {
        return response(res, 400, false, 'Email or Password is empty');
      }
      const user = await User.findOne({ 
        where: { email: email },
        include: [{ model: UserDetail }]
      });
      if (!user) {
        return response(res, 404, false, 'User not found', null);
      }
      if (!user.checkPassword(password)) {
        return response(res, 401, false, 'Password is incorrect', null);
      }
      const name = user.UserDetail.name;
      const image = user.UserDetail.image;
      return response(res, 200, true, 'Login success', {
        user: user,
        token: user.generateToken(name, image)
      })
    } catch (err) {
      console.log(err);
      return response(res, 500, false, 'Internal Server Error');
    }
  },
};
