const { user, product, wishlist } = require("../../models");
const response = require("../../../utils/formatResponse")

module.exports = {
    
    /* Whistlist API */
    postProductWishlist: async (req, res) => {
        try {
            const { product_id } = req.body;
            if (!product_id) {
                return response(res, 400, false, 'Data harus di isi', null)
            }
            
            const productData = await product.findOne({
                where: { id: product_id, is_release: true, status: true }
            })

            if (!productData) {
                return response(res, 404, false, 'Product not found', null)
            } else if (productData.user_id == req.user.id) {
                return response(res, 200, true, `You can't add your product to wishlist`, null)
            }

            const wish = await wishlist.findOne({ 
                where: { product_id: product_id, user_id: req.user.id}
            })
            if (wish){
                return response(res, 400, false, `Kamu tidak dapat menambahkan product yang sama ke wish`)
            }
            
            const wishData = await wishlist.create({ 
                product_id: product_id,
                user_id: req.user.id // data dari jwt
            });

            if (!wishData) { return response(res, 500, false, 'Something went wrong', null) }
            return response(res, 200, true, 'Success', wishData);
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            } else if(error.name === 'SequelizeValidationError') {
                return response(res, 400, false, error.errors[0].message, null);
            } else if(error.name === 'SequelizeUniqueConstraintError') {
                return response(res, 400, false, error.errors[0].message, null);
            } 
            return response(res, 500, false, "Internal Server Error", null);
        }
    },
    getProductWishlist: async (req, res) => { 
        try {
            const jwtData = req.user
            const wish = await wishlist.findOne({ 
                where: { id: req.params.id, user_id: jwtData.id },
                include: [
                    { model: user }, { model: product}
                ]
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
            const id = req.params.id
            const wishData = await wishlist.findOne({
                where: { id: id }
            })
            if (!wishData) { return response(res, 404, false, 'Wishlist not found', null); }
            else if (wishData.user_id !== req.user.id) { return response(res, 403, false, 'You are not allowed to delete this wishlist.', null) }
            await wishData.destroy()
            return response(res, 200, true, 'Success', null)
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            } else if (error.name === 'DataNotFoundError') {
                return response(res, 404, false, error.message, null);
            }
            return response(res, 500, false, "Internal Server Error", null);
        }
    },  
    getProductWishlistAll: async (req, res) => {
        try {
            const list = await wishlist.findAll({
                where: { user_id: req.user.id }
            })
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