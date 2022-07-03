'use strict';
const { Model } = require('sequelize')
const Constant = require('../../utils/constant')
module.exports = (sequelize, DataTypes) => {
  class notification extends Model {
    static associate(models) {
      this.belongsTo(models.product, {foreignKey: 'product_id'} )
      this.belongsTo(models.notification_category, { foreignKey: 'category_id', as: 'category' })
    }

    static async add({category_id, product_id, user_id, nego_price, price, status}) {
      console.log("Cetegory is : " + category_id);
      if(category_id == 1){
        return this.create({
          product_id : product_id,
          category_id : category_id,
          user_id : user_id,
          price : price,
          status : Constant.ACCEPTED
        })
      } else if(category_id == 2){
        return this.create({
          category_id : category_id,
          product_id : product_id,
          user_id : user_id,
          nego_price : nego_price,
          price : price,
          status : status
        })
      } 
      return 0
    }
    
    static async checked() {
      return await this.update({
        isChecked: true
      })
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
    user_id: DataTypes.INTEGER,
    status: {
      type: DataTypes.STRING, // 1. Pending 2. Accepted 3. Rejected
      allowNull: false,
      validate: {
        is: /^(pending|accepted|rejected)$/
      }
    },
    is_checked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    tableName: 'notifications',
    modelName: 'notification',
    underscored: true,
  })

  return notification;
};