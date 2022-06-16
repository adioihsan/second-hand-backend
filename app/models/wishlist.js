'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class wishlist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.product, {foreignKey: 'product_id'})
      this.belongsTo(models.User, {foreignKey: 'user_id'})
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