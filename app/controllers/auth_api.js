/** @format */

const { user} = require('../models');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
  register: async (req, res) => {
    // Our register logic starts here
    try {
      // Get user input
      const { username, password, email } = req.body;
      // Create user in our database
      const users = await user.create({
        username,
        email,
        password
      });

      // Create token
      const token = jwt.sign({ id: users.id }, "holaa", {
        expiresIn: '15m',
      });
      // save user token
      users.token = token;

      // return new user
      res.status(200).json({ message: 'Berhasil Membuat User Game', result: users });
    } catch (err) {
      res.status(500).json({ message: 'Gagal Create User Game', err: err.message });
    }
    // Our register logic ends here
  },
  loginAPI: async (req, res) => {
    // Our loginAPI logic starts here
    try {
      // Get user input
      const { username, password } = req.body;

      // Validate user input
      if (!(username && password)) {
        res.status(400).send('All input is required');
      }
      // Validate if user exist in our database
      const users = await user.findOne({
        where: {
          username: username,
          
        },
      });

      if (users && password) {
        // Create token
        const token = jwt.sign({ id: users.id, username,  role_id: users.role_id}, "holaa", {
          expiresIn: '15m',
        });

        // save user token
        users.token = token;

        // user
        res.status(200).json(users);
      } else {
        res.status(400).send('nama pengguna atau kata sandi salah!');
      }
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  },
};
