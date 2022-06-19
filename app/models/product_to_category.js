'use strict';
const {  Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class product_to_category extends Model {
    static associate(models) {
      // define association here
      this.belongsTo(models.product, {foreignKey: 'product_id'})
      this.belongsTo(models.category, {foreignKey: 'category_id'})
    }
  }
  product_to_category.init({
    product_id: DataTypes.INTEGER,
    category_id: DataTypes.INTEGER
  }, {
    sequelize,
    tableName: 'product_to_categories',
    modelName: 'product_to_category',
    underscored: true,
  });
  return product_to_category;
};