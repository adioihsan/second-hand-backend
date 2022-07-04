const { user, user_detail, product, product_to_category, image, category, wishlist, negotiation, notification } = require("../../models");
const response = require("../../../utils/formatResponse"); 
const fs = require("fs");
const { Op } = require('sequelize');
const helper = require('../../../utils/helpers');
const Constant = require("../../../utils/constant");

module.exports = {
    /* Product */
    postProduct: async (req, res) => {
        var temp_product_id = 0
        try {
            const jwtData = req.user
            const { name, price, description, images_url } = req.body;
            var categories = (typeof req.body.categories === 'string') ? [req.body.categories] : req.body.categories
            
            if(images_url){
                const imagesUrl = images_url.split(',')
                for(let i = 0; i < imagesUrl.length; i++) {
                    const imageSearch = await image.findOne({
                        where: { url: imagesUrl[i] }
                    })
                    if(!imageSearch) { return response(res, 400, false, `Image ${imagesUrl[i]} tidak ditemukan.`) }
                }
            }
            if (!categories) {
                const productData = await product.create({
                    name: name, 
                    price: price,
                    description: description,
                    user_id: jwtData.id,
                    images_url: images_url
                })
                return response(res, 200, true, 'Sukses menambahkan product', productData)
            }

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
            productData.categories = productToCategoryData
            
            return response(res, 200, true, 'Success', {
                product: productData
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
    deleteProduct: async (req, res) => {        
        try {
            const jwtData = req.user;
            const id = req.params.id;
            const productData = await product.findOne({
                where: { id: id }
            });
            if (!productData) { return response(res, 404, false, 'Product not found', null) }
            else if (productData.user_id !== jwtData.id) { 
                return response(res, 403, false, 'You are not authorized to delete this product', null) 
            }
            const deletedProduct = await productData.destroy()
            if (productData.images_url) {
                const imageUrls = productData.images_url.split(',')
                
                for (let i = 0; i < imageUrls.length; i++) {
                    await image.destroy({ where: { url: imageUrls[i] } });
                }
                imageUrls.map(url => {
                    fs.unlink("public/images/" + url, (err) => {
                        if (err) console.log(err)
                    })
                })
                return response(res, 200, true, 'Produk berhasil dihapus', null)
            }
            return response(res, 400, false, 'Produk berhasil dihapus', null)
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
            const productData = await product.findOne({ where: { id: id } })
            if (!productData) { return response(res, 404, false, 'Product not found', null) }
            else if (productData.user_id !== jwtData.id) { return response(res, 403, false, 'You are not authorized to release this product', null) }
            if (productData.is_release === true && is_release === "true"){
                return response(res, 400, true, 'Product Already Released!', null)
            } else if (productData.is_release === false && is_release === "false") {
                return response(res, 400, true, 'Product Already Unreleased!', null)
            }
            const updatedProduct = await productData.update({ is_release: is_release })
            await notification.add({
                category_id: 1,
                product_id: productData.id,
                user_id: productData.user_id,
                price: productData.price,
                status: Constant.ACCEPTED
            })
            if (updatedProduct) {
                if(updatedProduct.is_release == true) {
                    return response(res, 200, true, 'Product Released!', updatedProduct)
                }
                if(updatedProduct.is_release == false) {
                    return response(res, 200, true, 'Product Unreleased!', updatedProduct)
                }
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
    putProduct: async (req, res) => {
        try {
            const id = req.params.id
            const { name, price, description, images_url, images_url_delete } = req.body

            if(images_url){
                const imagesUrl = images_url.split(',')
                for(let i = 0; i < imagesUrl.length; i++) {
                    const imageSearch = await image.findOne({
                        where: { url: imagesUrl[i] }
                    })
                    if(!imageSearch) { return response(res, 400, false, `Image ${imagesUrl[i]} tidak ditemukan.`) }
                }
            }
            
            const productData = await product.findOne({
                where: { id: id },
                include: { model: category, attributes: ['id', 'name'] , through: { attributes: [] } } 
            })
            if (!productData) { return response(res, 404, false, 'Product not found', null) }
            else if (productData.user_id !== req.user.id) { return response(res, 403, false, 'You are not authorized to update this product', null) }
            
            const deleteProductCategory = await product_to_category.destroy({ where: { product_id: id } })
            const categories = (typeof req.body.categories === 'string') ? [req.body.categories] : req.body.categories
            if(categories) {
                const categoryData = await category.findAll({
                    where: { id: { [Op.in]: categories } }
                });
                const data = categories.map(category => {
                    return { product_id: id, category_id: category }
                })
                if (categoryData.length !== categories.length) { return response(res, 400, false, 'Category not found', null) }
                
                const productToCategoryData = await product_to_category.bulkCreate(data)
                if (!productToCategoryData ) {
                    return response(res, 400, false, 'Has failed to create product to category', null)
                }
            }
            const updatedProduct = await productData.update({
                name: name,
                price: price,
                description: description,
                images_url: images_url
            })
            var resProduct = await product.findOne({ where: { id: id },
                include: [
                    { model: user, attributes: ['id'], include: { model: user_detail, attributes: ['name','city', 'image',] } },
                    { model: category, attributes: ['id', 'name'] , through: { attributes: ['id'] } }
                ]
            })
            responseData = resProduct.toJSON()
            const userData = {
                id: resProduct.id,
                name: resProduct.user.user_detail.name,
                city: resProduct.user.user_detail.city,
                image: resProduct.user.user_detail.image,
            }
            delete responseData.user
            responseData.user = userData

            if (updatedProduct) {
                return response(res, 200, true, 'Product Updated!', responseData)
            }
            return response(res, 400, false, 'Update failed!', null)
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
    getProduct: async (req, res) => {
        try {
            const id = req.params.id
            const productData = await product.findOne({ 
                where: { 
                    id: id,
                },
                include: [{ 
                    model: user, attributes: ['id', 'email'], include: { model: user_detail, attributes: ['name', 'city', 'image'] }
                    },
                    { model: category, attributes: ['id', 'name'] , through: { attributes: [] } }
                ],
            })
            if (!productData) { return response(res, 404, false, 'Product not found', null) }
            else if (!productData.is_release && productData.user_id !== req.user.id) {
                return response(res, 403, false, 'You are not authorized to see this product', null)
            } else if( productData.user.id !== req.user.id) {
                return response(res, 403, false, 'You are not authorized to see this product', null)
            }
            const data = productData.toJSON()
            const userData = {
                id: productData.id,
                name: productData.user.user_detail.name,
                city: productData.user.user_detail.city,
                image: productData.user.user_detail.image,

            }
            delete data.user
            data.user = userData
            return response(res, 200, true, 'Success', data);
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Internal Server Error", null);
        }
    },
    getSellerProduct: async (req, res) => {
        try {
            const QFilter = req.query.filter || 1
            const arrayFilter = [1, 2, 3, 4]
            const filter = helper.slice(arrayFilter, [QFilter])[0]

            if(!filter){
                return response(res, 400, false, "Filter tidak tersedia", null)
            }
            const page = parseInt(req.query.page) || 1
            if (page < 1) {
                return response(res, 400, false, 'Page must be integer greater than 0', null)
            }
            const limit = parseInt(req.query.limit) || 12
            const offset = (parseInt(page) - 1) * limit
            
            var dataSearch = {
                limit: limit,
                offset: offset,
                distinct: true,
                include:  [
                    { model: category, attributes: ['id', 'name'] , through: { attributes: [] } }
                ]
            }
            if(filter == 2){
                dataSearch.where = { user_id: req.user.id, status: false }
            } else if(filter == 3) {
                dataSearch.where = { user_id: req.user.id, is_release: false }
            } else if(filter == 4) {
                const wishtlistData = await wishlist.findAll({
                    include: {
                        model: product, attributes: ['id', 'user_id'], 
                        where : {
                            user_id: req.user.id
                        }
                    }
                })
                const idWishArr = wishtlistData.map((row) =>  row.id )
                const productData = await product.findAndCountAll({
                    limit: limit,
                    offset: offset,
                    distinct: true,
                    include: {
                        model: wishlist, attributes: ['id', 'user_id'],
                        where : { id : { [Op.in]: idWishArr } },
                    }
                }) 
                productData.limit = limit
                productData.totalPage = Math.ceil(productData.count / limit)
                productData.page = parseInt(page)
                productData.nextPage = page < productData.totalPage ? parseInt(page) + 1 : null
                productData.prevPage = page > 1 ? parseInt(page) - 1 : null
                return response(res, 200, false, "Sukses", productData)
            } else {
                dataSearch.where = { user_id: req.user.id }
            }
            const productData = await product.findAndCountAll(dataSearch) 

            productData.limit = limit
            productData.totalPage = Math.ceil(productData.count / limit)
            productData.page = parseInt(page)
            productData.nextPage = page < productData.totalPage ? parseInt(page) + 1 : null
            productData.prevPage = page > 1 ? parseInt(page) - 1 : null
            return response(res, 200, true, 'Success', productData);

        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Internal Server Error", null);
        }   
    },
}