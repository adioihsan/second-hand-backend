'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class image extends Model {
    static associate(models) {
      this.belongsTo(models.product, {foreignKey: 'product_id'})
    }
  }
  image.init({
    url: DataTypes.STRING,
    product_id: DataTypes.INTEGER
  }, {
    sequelize,
    tableName: 'images',
    modelName: 'image',
    underscored: true,
  });
  return image;
};