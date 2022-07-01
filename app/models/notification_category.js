'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class notification_category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.notification, { foreignKey: 'category_id' })
    }
  }
  notification_category.init({
    title: DataTypes.STRING
  }, {
    sequelize,
    tableName: 'notification_categories',
    modelName: 'notification_category',
    underscored: true,
  });
  return notification_category;
};