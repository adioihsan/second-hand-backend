'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      user.hasOne(models.user_detail, {foreignKey: 'user_id', as: 'user_detail'})
    
    }
  }
  user.init({
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,

  }, {
    sequelize,
    tableName: 'users',
    modelName: 'user',
    underscored: true,
  });
  return user;
};