/** @format */

const { User, UserDetail, Otp } = require('../models');
const response = require('../../utils/formatResponse');
const emailTransporter = require('../libs/email.js');
const { emailWelcome, emailForgotPassword } = require('../../utils/emailFormat');

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
        // TODO : ADD OTP CODE TO VERIFY EMAIL SOON?
        const otp = await Otp.create({
          user_id: users.id
        })
        // console.log(otp)
        // TODO : ADD Email link or OTP to Verify EMAIL SOON? , Kalau tidak males 
        if (userDetail && otp) {
          // Mengirim email
          emailTransporter.sendMail(emailWelcome(name, email), (err, info) => {
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
      return response(res, 500, false, 'Register Failed', null)
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
  // POST /forgot-password
  postForgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return response(res, 400, false, 'Email is empty');
      }
      const isEmail = (email) => {
        const regex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/ // Email validation menggunakan RegEx
        return regex.test(email);
      }
      if (!isEmail(email)) {
        return response(res, 400, false, 'Email is invalid');
      }
      const user = await User.findOne({ 
        where: { email: email },
        include: [{ model: Otp }]    
      });
      if (!user) {
        return response(res, 404, false, 'User not found', null);
      } 
      const dataOTP = {
        code: Math.floor(Math.random() * 1000000),
        user_id: user.id
      }
      console.log(user);
      const otp = await user.Otp.update(dataOTP)
      if (otp) {
        // Mengirim email
        emailTransporter.sendMail(emailForgotPassword(email, dataOTP.code), (err, info) => {
          if (err) {
              return response(res, 500, false, err.message, null)
          } else {
              console.log(info)
          }
        })
        return response(res, 200, true, 'OTP has been sent, Please check your email!', null)
      }
      return response(res, 500, false, 'Internal Server Error', null)
    } catch (err) {
      console.log(err);
      return response(res, 500, false, 'Internal Server Error');
    }  
  },
  // POST /reset-password
  postResetPassword: async (req, res) => {
    try {
      const { email, code, password } = req.body;
      const isEmail = (email) => {
        const regex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/; // Email validation menggunakan RegEx
        return regex.test(email);
      }
      if (!isEmail(email)) {
        return response(res, 400, false, 'Email is invalid');
      }
      if (!code) {
        return response(res, 400, false, 'Code is empty');
      }
      if (!password) {
        return response(res, 400, false, 'Password is empty');
      }
      const user = await User.findOne({
        where: { email: email },
        include: [{ model: Otp }]
      });
      if (!user) {
        return response(res, 404, false, 'User not found', null);
      }
      if(user.Otp.code !== parseInt(code)) {
        return response(res, 400, false, 'OTP is incorrect', null);
      }
      const dateNow = new Date().getTime() // ambil waktu sekarang
      const dateUpdated = user.Otp.updatedAt.getTime() // ambil tanggal update otp
      const expire_in = 120000 // 2 minutes
      const dateExpired = dateUpdated + expire_in
      if (dateNow > dateExpired) {
        return response(res, 404, false, 'OTP Expired', null)
      }
      const updateUser = user.update({ password: password })
      if (updateUser) {
        return response(res, 200, true, 'Password has been updated', null)
      }
      return response(res, 500, false, 'Internal Server Error', null)
    } catch {
      console.log(err);
      return response(res, 500, false, 'Internal Server Error');
    }
  },
};
