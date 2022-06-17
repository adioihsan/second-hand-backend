const { category } = require("../models");
const response = require("../../utils/formatResponse"); 

module.exports = {
    getCategories: async (req, res) => {
        try {
            const jwtData = req.category; // Ngambil Data dari req.body isinya data user, didapat dari passport-JWT
            console.log("JWT : ", jwtData); // coba liat data nya
            const categories = await category.findAll();
            if (!categories) { return response(res, 404, false, 'Category Detail not found', categories) }
            return response(res, 200, true, 'Success', categories);
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Internal Server Error", null);
        }
    }
}