'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class otp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  otp.init({
    code: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    expired: DataTypes.INTEGER
  }, {
    sequelize,
    tableName: 'otp',
    modelName: 'otp',
    underscored: true,
  });
  return otp;
};