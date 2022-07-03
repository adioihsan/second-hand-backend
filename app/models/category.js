'use strict';
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class category extends Model {
    static associate(models) {
      // define association here
      this.belongsToMany(models.product, {through: 'product_to_categories', foreignKey: 'category_id'})
    }
  }
  category.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    tableName: 'categories',
    modelName: 'category',
    underscored: true,
  });
  return category;
};