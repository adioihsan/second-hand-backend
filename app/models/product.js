'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class product extends Model {
    static associate(models) {
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
      validate: {
        notEmpty: {
          msg: 'Name is required'
        }
      }
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: 'Price must be integer' },
        min: 0
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: 'User id must be integer' },
        min: 1
      }
    },
    images_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_release: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false // false: not release, true: release
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true // false: not available, true: available
    }
  }, {
    sequelize,
    tableName: 'products',
    modelName: 'product',
    underscored: true,
  });
  return product;
};