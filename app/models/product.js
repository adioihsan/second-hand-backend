'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class product extends Model {
    static associate(models) {
      this.hasMany(models.image, {foreignKey: 'product_id'})
      this.hasMany(models.wishlist, {foreignKey: 'product_id'})
      this.hasMany(models.negotiation, {foreignKey: 'product_id'})
      this.belongsTo(models.user, {foreignKey: 'user_id'})
      this.belongsToMany(models.category, {through: 'product_to_categories', foreignKey: 'product_id'})
    }
  }
  product.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: 'Price must be integer' },
        min: 0
      }
    },
    description: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    is_release: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false // false: not release, true: release
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false // false: not available, true: available
    }
  }, {
    sequelize,
    tableName: 'products',
    modelName: 'product',
    underscored: true,
  });
  return product;
};