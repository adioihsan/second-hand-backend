'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    
    const data = [{
      title: 'Berhasil Diterbitkan',
      created_at: new Date(),
      updated_at: new Date(),
    }, {
      title: 'Penawaran produk',
      created_at: new Date(),
      updated_at: new Date(),
    }, ]
    
    await queryInterface.bulkInsert('notification_categories', data);
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
