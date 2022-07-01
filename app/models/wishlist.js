'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class wishlist extends Model {
    static associate(models) {
      this.belongsTo(models.product, {foreignKey: 'product_id'})
      this.belongsTo(models.user, {foreignKey: 'user_id'})
    }
  }
  wishlist.init({
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Product ID is required'
        }
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'User ID is required'
        }
      }
    }
  }, {
    sequelize,
    tableName: 'wishlists',
    modelName: 'wishlist',
    underscored: true,
  });
  return wishlist;
};