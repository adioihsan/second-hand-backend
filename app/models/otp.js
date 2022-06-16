'use strict';
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class otp extends Model {
    static associate(models) {
      this.belongsTo(models.user, {foreignKey: 'user_id'})
    }
  }
  otp.init({
    code: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    tableName: 'otps',
    modelName: 'otp',
    underscored: true,
  });
  return otp;
};