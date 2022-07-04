'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    
    const data = [{
      name: 'Hoby',
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      name: 'Vehicles',
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      name: 'Clothes',
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      name: 'Electronics',
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      name: 'Health',
      created_at: new Date(),
      updated_at: new Date(),
    }
  ]

    await queryInterface.bulkInsert('categories', data)

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};