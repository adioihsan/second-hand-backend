'use strict';
const { Model } = require('sequelize')
const { encrypt, comparePassword} = require('../../utils/encrypt')
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    static associate(models) {
      this.hasOne(models.user_detail, {foreignKey: 'user_id'})
      this.hasOne(models.otp, {foreignKey: 'user_id'})
      this.hasMany(models.product, {foreignKey: 'user_id'})
      this.hasMany(models.negotiation, {foreignKey: 'user_id_buyer'})
      this.hasMany(models.wishlist, {foreignKey: 'user_id'})
    }

    static register = async ({ email, password }) => {
      const encryptedPassword = encrypt(password);
      return this.create({ email: email, password: encryptedPassword, is_verified: false });
    };
    
    checkPassword = (password) => comparePassword(password, this.password);

    static authenticate = async (email, password) => {
      try {
        const user = await this.findOne({ where: { email: email }});
        if(!user) {
          return Promise.reject(new Error('Pengguna tidak ditemukan'));
        }
        if(!user.checkPassword(password)){
          return Promise.reject(new Error('Password salah!'));
        }
        return Promise.resolve(user);
      } catch (error) {
        return Promise.reject(error);
      }
    }

    generateToken = (name, image) => {
      const token = jwt.sign({
        id: this.id,
        email: this.email,
        name: name,
        photo: image
      }, process.env.JWT_SECRET, { expiresIn: '5h' });
      return token;
    }

  }
  user.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notNull: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: true,
        notEmpty: true
      }
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }                         
  }, {
    sequelize,
    tableName: 'users',
    modelName: 'user',
    underscored: true,
  });
  return user;
};