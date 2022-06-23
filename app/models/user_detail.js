'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class user_detail extends Model {
    static associate(models) {
      this.belongsTo(models.user, {foreignKey: 'user_id'})
    }
  }
  user_detail.init({
    name: DataTypes.STRING,
    city: DataTypes.STRING,
    address: DataTypes.STRING,
    image: DataTypes.STRING,
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isNumeric: { // nah ini namanya validasi bawaan sequelize, kalau isNumeric, maka akan menampilkan error, bawa
          msg: 'Phone number must be numeric'
        }
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    tableName: 'user_details',
    modelName: 'user_detail',
    underscored: true,
  });
  return user_detail;
};