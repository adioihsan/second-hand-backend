'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.notification_category, { foreignKey: 'category_id' })
    }
  }
  notification.init({
    product_id: DataTypes.INTEGER,
    category_id: DataTypes.INTEGER,
    nego_price: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: { msg: 'Price must be integer' },
        min: 0
      }
    },
    price: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: { msg: 'Price must be integer' },
        min: 0
      }
    },
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    tableName: 'notifications',
    modelName: 'notification',
    underscored: true,
  });
  return notification;
};