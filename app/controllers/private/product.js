const { user, user_detail, product, product_to_category, image, category, wishlist, negotiation, notification } = require("../../models");
const response = require("../../../utils/formatResponse"); 
const fs = require("fs");
const { Op } = require('sequelize');
const helper = require('../../../utils/helpers');
const Constant = require("../../../utils/constant");
const { deleteImage } = require("../../libs/firebaseStorage");


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
                    if(!imageSearch) { return response(res, 400, false, `Foto ${imagesUrl[i]} tidak ditemukan.`) }
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
                return response(res, 200, true, 'Berhasil menambahkan product', productData)
            }

            const categoryData = await category.findAll({
                where: { id: { [Op.in]: categories } } 
            })

            if (categoryData.length !== categories.length) { return response(res, 400, false, 'Kategori tidak ditemukan', null) }
            const productUserUser = await product.findAll({  where: {  user_id: jwtData.id, status: true } });
            if (productUserUser.length >= 4) { return response(res, 400, false, 'Kamu hanya bisa membuat 4 produk', null) }
            if (categories.length > 5) { return response(res, 400, false, 'Kamu hanya bisa menambahkan 5 kategori', null) }

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
                return response(res, 400, false, 'Gagal untuk membuat produk ke kategori', null)
            }
            productData.categories = productToCategoryData
            
            return response(res, 200, true, 'Berhasil', {
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
                return response(res, 500, false, "Server Internal lagi error nih", null);
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
            if (!productData) { return response(res, 404, false, 'Produk tidak ditemukan', null) }
            else if (productData.user_id !== jwtData.id) { 
                return response(res, 403, false, 'Kamu belum terotorisasi untuk menghapus produk ini', null) 
            }
            const deletedProduct = await productData.destroy()
            if (productData.images_url) {
                const imageUrls = productData.images_url.split(',')
                
                for (let i = 0; i < imageUrls.length; i++) {
                    await image.destroy({ where: { url: imageUrls[i] } });
                }
                imageUrls.map(url => deleteImage(url) )
                return response(res, 200, true, 'Produk berhasil dihapus', null)
            }
            return response(res, 400, false, 'Produk berhasil dihapus', null)
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Server Internal lagi error nih", null);
        }
    },
    patchProductRelease: async (req, res) => {
        try {
            const jwtData = req.user;
            const id = req.params.id;
            const { is_release } = req.body;
            // is is_release boolean
            var regex = /^(true|false)$/;
            if (!regex.test(is_release)) { return response(res, 400, false, 'is_release harus bilangan bulat (true/false)', null) }
            const productData = await product.findOne({ where: { id: id } })
            if (!productData) { return response(res, 404, false, 'Produk tidak ditemukan', null) }
            else if (productData.user_id !== jwtData.id) { return response(res, 403, false, 'Kamu belum terotorisasi untuk merilis produk ini', null) }
            if (productData.is_release === true && is_release === "true"){
                return response(res, 400, true, 'Produk sudah dirilis!', null)
            } else if (productData.is_release === false && is_release === "false") {
                return response(res, 400, true, 'Product belum dirilis!', null)
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
                    return response(res, 200, true, 'Produk dirilis!', updatedProduct)
                }
                if(updatedProduct.is_release == false) {
                    return response(res, 200, true, 'Produk belum dirilis!', updatedProduct)
                }
            }
            return response(res, 400, false, 'Gagal rilis!', null)
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Server Internal lagi error nih", null);
        }
    },
    patchProductSold: async (req, res) => {
        try {
            const jwtData = req.user;
            const id = req.params.id;
            const { status } = req.body;
            // is status boolean
            var regex = /^(true|false)$/;
            if (!regex.test(status)) { return response(res, 400, false, 'is_sold harus bilangan bulat (true/false)', null) }
            // const allProductData = await product.findAll({ where: { user_id : jwtData.id, status: true, is_release: true } }) 
            const productData = await product.findOne({
                where: { id: id },
            })
            if (!productData) { return response(res, 404, false, 'Produk tidak ditemukan', null) }
            else if (productData.user_id !== jwtData.id) { return response(res, 403, false, 'Kamu belum terotorisasi untuk menghapus produk ini', null) }
            const updatedProduct = await productData.update({
                status: status
            });
            if (updatedProduct) {
                return response(res, 200, true, 'Produk terjual!', updatedProduct)
            }
            return response(res, 400, false, 'Gagal terjual!', null)
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Server Internal lagi error nih", null);
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
                    if(!imageSearch) { return response(res, 400, false, `Foto ${imagesUrl[i]} tidak ditemukan.`) }
                }
            }
            
            const productData = await product.findOne({
                where: { id: id },
                include: { model: category, attributes: ['id', 'name'] , through: { attributes: [] } } 
            })
            if (!productData) { return response(res, 404, false, 'Produk tidak ditemukan', null) }
            else if (productData.user_id !== req.user.id) { return response(res, 403, false, 'Kamu belum terotorisasi untuk mengupdate produk ini', null) }
            
            const deleteProductCategory = await product_to_category.destroy({ where: { product_id: id } })
            const categories = (typeof req.body.categories === 'string') ? [req.body.categories] : req.body.categories
            if(categories) {
                const categoryData = await category.findAll({
                    where: { id: { [Op.in]: categories } }
                });
                const data = categories.map(category => {
                    return { product_id: id, category_id: category }
                })
                if (categoryData.length !== categories.length) { return response(res, 400, false, 'Kategori tidak ditemukan', null) }
                
                const productToCategoryData = await product_to_category.bulkCreate(data)
                if (!productToCategoryData ) {
                    return response(res, 400, false, 'Gagal untuk membuat produk ke kategori', null)
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
                return response(res, 200, true, 'Produk terupdate!', responseData)
            }
            return response(res, 400, false, 'Gagal update!', null)
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            } else if(error.name === 'SequelizeValidationError') {
                return response(res, 400, false, error.errors[0].message, null);
            } else if(error.name === 'SequelizeUniqueConstraintError') {
                return response(res, 400, false, error.errors[0].message, null);
            } 
            return response(res, 500, false, "Server Internal lagi error nih", null);
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
            if (!productData) { return response(res, 404, false, 'Produk tidak ditemukan', null) }
            else if (!productData.is_release && productData.user_id !== req.user.id) {
                return response(res, 403, false, 'Kamu belum terotorisasi untuk melihat produk ini', null)
            } else if( productData.user.id !== req.user.id) {
                return response(res, 403, false, 'Kamu belum terotorisasi untuk melihat produk ini', null)
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
            return response(res, 200, true, 'Berhasil', data);
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Server Internal lagi error nih", null);
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
                return response(res, 400, false, 'Halaman harus bilangan bulat lebih besar dari 0', null)
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
                return response(res, 200, false, "Berhasil", productData)
            } else {
                dataSearch.where = { user_id: req.user.id }
            }
            const productData = await product.findAndCountAll(dataSearch) 

            productData.limit = limit
            productData.totalPage = Math.ceil(productData.count / limit)
            productData.page = parseInt(page)
            productData.nextPage = page < productData.totalPage ? parseInt(page) + 1 : null
            productData.prevPage = page > 1 ? parseInt(page) - 1 : null
            return response(res, 200, true, 'Berhasil', productData);

        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Server Internal lagi error nih", null);
        }   
    },
    getProductNegotiattion: async (req, res) => {
        try {
            const product_id = req.params.id
            const user_id = req.user.id

            const negotiationData = await negotiation.findOne({
                where: {
                    product_id: product_id,
                    user_id_buyer: user_id,
                },
                include: { model: product, attributes: ['id', 'name'] }
            })

            if (!negotiationData) {
                return response(res, 404, false, "Negosiasi tidak ditemukan", null)
            } 
            return response(res, 200, true, "Negosiasi ditemukan", negotiationData)
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Internal Server Error", null);
        }
    },
    getProductWish: async (req, res) => {
        try {
            const product_id = req.params.id
            const jwtData = req.user
            
            const wish = await wishlist.findOne({ 
                where: { 
                    product_id: product_id, 
                    user_id: jwtData.id 
                },
                include: [
                    { model: user, attributes: ['id', 'email'] }, { model: product, attributes: ['id', 'name', 'user_id', 'status']}
                ]
            });

            if (!wish) {
                return response(res, 404, false, "Wishlist tidak ditemukan", null)
            } 
            return response(res, 200, true, "Wishlist ditemukan", wish)
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Internal Server Error", null);
        }
    }
}