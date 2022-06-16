'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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