const { user, user_detail, product, product_to_category, image, category, wishlist } = require("../models");
const response = require("../../utils/formatResponse"); 
const fs = require("fs");
const { Op } = require('Sequelize');

module.exports = {
    /* User Detail */
    putUserDetail: async (req, res) => {
        try {
            const jwtData = req.user  // Ngambil Data dari req.body isinya data user, didapat dari passport-JWT
            const { name, city, address, phone } = req.body;
            const filename = req.file ? req.file.filename : null;
            const userData = await user.findOne({  
                where: { id: jwtData.id }, 
                include: { model: user_detail } 
            });
            
            var UserDetailData = {}
            if (!userData) { return response(res, 404, false, 'User not found', null) }
            if (filename) {
                UserDetailData = {                      
                    name: name,
                    city: city,
                    address: address,
                    phone: phone,
                    image: req.file.filename
                }
            } else {
                UserDetailData = {                
                    name: name,
                    city: city,
                    address: address,
                    phone: phone
                }
            }
            const updatedUserDetail= await userData.user_detail.update(UserDetailData);
            if (updatedUserDetail) { return response(res, 200, true, 'User Detail Updated!', updatedUserDetail) }
            return response(res, 400, false, 'Update failed!', null)
        } catch (error) {
            console.log(error); // setiap catch harus ada ini
            if (error.name === 'SequelizeDatabaseError') { // Bisa tau name error coba liat di console, ada bagian error name.. 
                return response(res, 400, false, error.message, null);
            } else if (error.name === 'SequelizeValidationError') { // Ketika Validasi Dari Input Salah, Bisa tau name error coba liat di console, ada bagian error name.. 
                return response(res, 400, false, error.errors[0].message, null);
            } // Kalau mau nambahin lagi boleh, tinggal namenya error di else if
            return response(res, 500, false, "Internal Server Error", null); // Jika Error Lainnya, 
        }
    },
    getUserDetail: async (req, res) => { 
        try {
            const jwtData = req.user; // Ngambil Data dari req.body isinya data user, didapat dari passport-JWT
            const userDetail = await user_detail.findOne({ 
                where: { user_id: jwtData.id }
            });
            if (!userDetail) { return response(res, 404, false, 'User Detail not found', userDetail) }
            return response(res, 200, true, 'Success', userDetail);
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Internal Server Error", null);
        }
    },

    /* Image */
    postImage: async (req, res) => {
        try {
            const file = req.file;
            if (!file) { return response(res, 400, false, 'Please upload file', null) }
            const imageData = await image.create({ url: file.filename })
            if (imageData) { return response(res, 200, true, 'Image Uploaded!', imageData) }
            return response(res, 400, false, 'Upload failed!', null)
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Internal Server Error", null);
        }
    },
    deleteImage: async (req, res) => {
        try {
            const jwtData = req.user; 
            const { url } = req.body
            const urlArray = url.split("_")
            console.log(urlArray);
            const idUserInImage = parseInt(urlArray[0])
            if (idUserInImage !== jwtData.id) { return response(res, 400, false, 'You are not authorized to delete this image', null) }

            const imageData = await image.findOne({ where: { url: url } })
            if (!imageData) { return response(res, 404, false, 'Image not found', null) }
            const deletedImage = await imageData.destroy()
            if (deletedImage) { 
                fs.unlinkSync(`./public/images/${url}`);
                return response(res, 200, true, 'Image Deleted!', null) }
            return response(res, 400, false, 'Delete failed!', null)
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Internal Server Error", null);
        }
    },

    /* Product */
    postProduct: async (req, res) => {
        var temp_product_id = 0
        try {
            const jwtData = req.user
            const { name, price, description, images_url } = req.body;
            const categories = (typeof req.body.categories === 'string') ? [req.body.categories] : req.body.categories
            const categoryData = await category.findAll({
                where: { id: { [Op.in]: categories } } 
            })
            
            if (categoryData.length !== categories.length) { return response(res, 400, false, 'Category not found', null) }
            const productUserUser = await product.findAll({  where: {  user_id: jwtData.id, status: true } });
            if (productUserUser.length >= 4) { return response(res, 400, false, 'You can only create 4 products', null) }
            if (categories.length > 5) { return response(res, 400, false, 'You can only add 5 categories', null) }

            const productData = await product.create({
                name: name, 
                price: price,
                description: description,
                user_id: jwtData.id,
                images_url: images_url
            });
            temp_product_id = productData.id
            // Insert Product to Category
            let data = categories.map(category => {
                return { product_id: productData.id, category_id: parseInt(category) }
            })
            const productToCategoryData = await product_to_category.bulkCreate(data)
            if (!productToCategoryData ) {
                return response(res, 400, false, 'Has failed to create product to category', null)
            }
            return response(res, 200, true, 'Success', {
                product: productData,
                category: productToCategoryData,
            });

        } catch (error) {
            console.log(error);
            await product.destroy({  where: { id: temp_product_id } })
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            } else if(error.name === 'SequelizeValidationError') {
                return response(res, 400, false, error.errors[0].message, null);
            } else if(error.name === 'SequelizeUniqueConstraintError') {
                return response(res, 400, false, error.errors[0].message, null);
            } else {
                return response(res, 500, false, "Internal Server Error", null);
            }
        }
    },  
    // TODO : Perbaiki image Delete
    deleteProduct: async (req, res) => {
        try {
            const jwtData = req.user;
            const id = req.params.id;
            const productData = await product.findOne({
                where: { id: id },
                include: [
                    { model: image, attributes: ['id', 'url'] },
                ]
            });
            if (!productData) { return response(res, 404, false, 'Product not found', null) }
            else if (productData.user_id !== jwtData.id) { 
                return response(res, 403, false, 'You are not authorized to delete this product', null) 
            }
            const deletedProduct = await product.destroy({
                where: { id: id }
            });
            if (deletedProduct) {
                productData.images.map(image => {
                     fs.unlink("public/images/" + image.url, (err) => {
                        if (err) console.log(err)
                    })
                })
                return response(res, 200, true, 'Product Deleted!', deletedProduct)
            }
            return response(res, 400, false, 'Delete failed!', null)
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Internal Server Error", null);
        }
    },
    patchProductRelease: async (req, res) => {
        try {
            const jwtData = req.user;
            const id = req.params.id;
            const { is_release } = req.body;
            // is is_release boolean
            var regex = /^(true|false)$/;
            if (!regex.test(is_release)) { return response(res, 400, false, 'is_release must be boolean (true/false)', null) }
            const productData = await product.findOne({
                where: { id: id }
            })
            if (!productData) { return response(res, 404, false, 'Product not found', null) }
            else if (productData.user_id !== jwtData.id) { return response(res, 403, false, 'You are not authorized to delete this product', null) }
            const updatedProduct = await productData.update({
                is_release: is_release
            });
            if (updatedProduct) {
                return response(res, 200, true, 'Product Released!', updatedProduct)
            }
            return response(res, 400, false, 'Release failed!', null)
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Internal Server Error", null);
        }
    },
    patchProductSold: async (req, res) => {
        try {
            const jwtData = req.user;
            const id = req.params.id;
            const { status } = req.body;
            // is status boolean
            var regex = /^(true|false)$/;
            if (!regex.test(status)) { return response(res, 400, false, 'is_sold must be boolean (true/false)', null) }
            // const allProductData = await product.findAll({ where: { user_id : jwtData.id, status: true, is_release: true } }) 

            const productData = await product.findOne({
                where: { id: id },
            })
            if (!productData) { return response(res, 404, false, 'Product not found', null) }
            else if (productData.user_id !== jwtData.id) { return response(res, 403, false, 'You are not authorized to delete this product', null) }
            const updatedProduct = await productData.update({
                status: status
            });
            if (updatedProduct) {
                return response(res, 200, true, 'Product Sold!', updatedProduct)
            }
            return response(res, 400, false, 'Sold failed!', null)
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Internal Server Error", null);
        }
    },
    // TODO : Belum Jadi
    putProduct: async (req, res) => {
        try {
            const jwtData = req.user;
            const id = req.params.id;
            const { name, price, description, images_url } = req.body;
            const productData = await product.findOne({
                where: { id: id }
            });
            if (!productData) { return response(res, 404, false, 'Product not found', null) }
            else if (productData.user_id !== jwtData.id) { return response(res, 403, false, 'You are not authorized to update this product', null) }
            const categories = (typeof req.body.categories === 'string') ? [req.body.categories] : req.body.categories
            const categoryData = await category.findAll({
                where: { id: { [Op.in]: categories } }
            });

            if (categoryData.length !== categories.length) { return response(res, 400, false, 'Category not found', null) }
            const updatedProduct = await productData.update({
                name: name,
                price: price,
                description: description,
                images_url: images_url
            });
            if (updatedProduct) {
                return response(res, 200, true, 'Product Updated!', updatedProduct)
            }
            return response(res, 400, false, 'Update failed!', null)
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Internal Server Error", null);
        }
    },
    //masih belum
    postProductWishlist: async (req, res) => {
        try {
            const { product_id, user_id } = req.body;
            // const wish = await wishlist.findOne({ 
            //     where: { product_id: product_id }
            // })
            // // if (wish == id) { return response(res, 400, false, 'Already', wish) }
            // if (wish != product_id) { return response(res, 400, false, 'Wish Not Found', wish) }
            const list = await wishlist.create({ 
                product_id: product_id,
                user_id: user_id     
            });

            // if (list == product_id) { return response(res, 400, false, 'Already', list) }
            // if (list != wish) { return response(res, 400, false, 'Wish Not Found', list) }
            if (!list) { return response(res, 404, false, 'yes', list) }
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