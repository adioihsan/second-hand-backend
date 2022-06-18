const { user, user_detail, product, product_to_category, image, category, sequelize } = require("../models");
const response = require("../../utils/formatResponse"); 
const fs = require("fs");
const { Op } = require('Sequelize');

module.exports = {
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
    postProduct: async (req, res) => {
        var temp_product_id = 0
        try {
            const jwtData = req.user
            const { name, price, description } = req.body;
            const categories = (typeof req.body.categories === 'string') ? [req.body.categories] : req.body.categories
            const categoryData = await category.findAll({
                where: { id: { [Op.in]: categories } } 
            });
            if (categoryData.length !== categories.length) { return response(res, 400, false, 'Category not found', null) }
            
            const productData = await product.create({
                name: name, 
                price: price,
                description: description,
                user_id: jwtData.id
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
            // Insert Images
            const imageData = await image.bulkCreate(req.files.map(image => {
                return { product_id: productData.id, url: image.filename }
            }))
            if (!imageData) {
                return response(res, 400, false, 'Has failed to create image', null)
            }
            return response(res, 200, true, 'Success', {
                product: productData,
                category: productToCategoryData,
                images: imageData
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
    getProduct: async (req, res) => {
        try {
            const id = req.params.id;
            const productData = await product.findOne({ 
                where: { id: id },
                include: { model: user, attributes: ['name', 'email'] },
                include: { model: image, attributes: ['id','url'] },
                include: { model: category, attributes: ['id', 'name'] , through: { attributes: [] } }
            })
            console.log(productData);
            if (!productData) { return response(res, 404, false, 'Product not found', null) }
            return response(res, 200, true, 'Success', productData);
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Internal Server Error", null);
        }
    },
    putProduct: async (req, res) => {},
    deleteProduct: async (req, res) => {},
    getProducts: async (req, res) => {
        
    },
}