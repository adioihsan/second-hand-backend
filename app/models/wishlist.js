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
    product_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    tableName: 'wishlists',
    modelName: 'wishlist',
    underscored: true,
  });
  return wishlist;
};