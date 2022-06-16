'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class negotiation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {foreignKey: 'user_id'})
    }
  }
  negotiation.init({
    user_id_buyer: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    status: DataTypes.ENUM
  }, {
    sequelize,
    tableName: 'negotiations',
    modelName: 'negotiation',
    underscored: true,
  });
  return negotiation;
};