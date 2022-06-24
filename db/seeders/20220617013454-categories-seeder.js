'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */ 
    await queryInterface.bulkInsert('categories', [
      {
      name: 'Hobby',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'Vehicles',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'Clothes',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'Electronics',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'Health',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ], {});
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
