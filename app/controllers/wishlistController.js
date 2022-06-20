const { wishlist } = require("../models");
const response = require("../../utils/formatResponse"); 
const fs = require("fs");

module.exports = {
    postProductWishlist: async (req, res) => {
        try {
            const jwtData = req.wishlist;
            console.log("JWT : ", jwtData);
            const { product_id, user_id } = req.body;
            const list = await wishlist.create({ 
                product_id: product_id,
                user_id: user_id             
            });
            if (!list) { return response(res, 404, false, 'Wish List not found', list) }
            return response(res, 200, true, 'Success', list);
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Internal Server Error", null);
        }
    },
    getProductWishlist: async (req, res) => { 
        try {
            const wish = await wishlist.findOne({ 
                where: { id: req.params.id }
            });
            if (!wish) { return response(res, 404, false, 'Wish List not found', wish) }
            return response(res, 200, true, 'Success', wish);
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Internal Server Error", null);
        }
    },
    deleteProductWishlist: async (req, res) => {
        try {
            const wish = await wishlist.destroy({ 
                where: { id: req.params.id }
            });
            if (!wish) { return response(res, 404, false, 'Wish List not found', wish) }
            return response(res, 200, true, 'Success', wish);
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Internal Server Error", null);
        }
    },  
    getProductWishlistAll: async (req, res) => {
        try {
            const jwtData = req.wishlist; // Ngambil Data dari req.body isinya data user, didapat dari passport-JWT
            console.log("JWT : ", jwtData); // coba liat data nya
            const list = await wishlist.findAll();
            if (!list) { return response(res, 404, false, 'Wish list Detail not found', list) }
            return response(res, 200, true, 'Success', list);
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Internal Server Error", null);
        }
    },
}