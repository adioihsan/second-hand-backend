/** @format */

const { user_game } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

module.exports = {
  getuser_game_api: (req, res) => {
    user_game
      .findAll({
        attributes: ['user_id', 'user_password', 'user_username'],
      })
      .then((result) => {
        if (result.length > 0) {
          res.status(200).json({ message: 'Berhasil Get All User Game', data: result });
        } else {
          res.status(404).json({ message: 'User Game not found', data: result });
        }
      })
      .catch((err) => {
        res.status(500).json({ message: 'Gagal Get All User Game', err: err.message });
      });
  },
  getuser_gamebyid_api: (req, res) => {
    user_game
      .findOne({
        where: {
          user_id: req.params.id,
        },
        attributes: ['user_id', 'user_username', 'user_password'],
      })
      .then((result) => {
        if (result) {
          res.status(200).json({ message: 'Berhasil mendapatkan user game by id', result });
        } else {
          res.status(404).json({
            message: 'User Game dengan ID ' + req.params.id + ' Tidak di temukan',
            result,
          });
        }
      })
      .catch((err) => {
        res.status(500).json({ message: 'Gagal Get User Game By Id', err: err.message });
      });
  },
  create_user_game_api: async (req, res) => {
    try {
      const { email, user_id, user_username, user_password } = req.body;
      const hashedPassword = await bcrypt.hash(user_password, 10);
      const user = await user_game.create({
        email,
        user_id,
        user_username,
        user_password: hashedPassword,
      });
      const token = jwt.sign({ user_id: user.user_id }, process.env.TOKEN_KEY, {
        expiresIn: '15m',
      });
      user.token = token;

      res.status(200).json({ message: 'Berhasil Membuat User Game', result: user });
    } catch (error) {
      res.status(500).json({ message: 'Gagal Create User Game', err: error.message });
    }
  },
  update_user_game_api: (req, res) => {
    user_game
      .update(
        {
          email,
          user_username: req.body.user_username,
          user_password: req.body.user_password,
        },
        {
          where: {
            user_id: req.params.id,
          },
        }
      )
      .then((result) => {
        if (result[0] === 0) {
          res.status(404).json({
            message: 'User Game dengan ID ' + req.params.id + ' Tidak di temukan',
            result,
          });
        } else {
          res.status(200).json({ message: 'Berhasil Mengupdate User Game', result });
        }
      })
      .catch((err) => {
        res.status(500).json({ message: 'Gagal Mengupdate User Game', err: err.message });
      });
  },
  delete_user_game_api: (req, res) => {
    user_game
      .destroy({
        where: {
          user_id: req.params.id,
        },
      })
      .then((result) => {
        if (result[0] === 0) {
          res.status(404).json({
            message: 'User Game dengan ID ' + req.params.id + ' Tidak di temukan',
            result,
          });
        } else {
          res.status(200).json({ message: 'Berhasil Menghapus User Game', result });
        }
      })
      .catch((err) => {
        res.status(500).json({ message: 'Gagal Menghapus User Game', err: err.message });
      });
  },
};
