'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class negotiation extends Model {
    static associate(models) {
      this.belongsTo(models.user, {foreignKey: 'user_id'})
    }
  }
  negotiation.init({
    user_id_buyer: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    tableName: 'negotiations',
    modelName: 'negotiation',
    underscored: true,
  });
  return negotiation;
};