'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.image, {foreignKey: 'product_id'})
      this.hasMany(models.wishlist, {foreignKey: 'product_id'})
      this.hasMany(models.negotiation, {foreignKey: 'product_id'})
      // this.belongtoMany(models.product_to_category, {foreignKey: 'product_id'})
      this.belongsTo(models.User, {foreignKey: 'user_id'})
    }
  }
  product.init({
    name: DataTypes.STRING,
    price: DataTypes.INTEGER,
    description: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    is_release: DataTypes.BOOLEAN,
    status: DataTypes.BOOLEAN
  }, {
    sequelize,
    tableName: 'products',
    modelName: 'product',
    underscored: true,
  });
  return product;
};