'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class image extends Model {
    static associate(models) { }
  }
  image.init({
    url: DataTypes.STRING,
  }, {
    sequelize,
    tableName: 'images',
    modelName: 'image',
    underscored: true,
  });
  return image;
};