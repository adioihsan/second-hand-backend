const { user, user_detail, product, category } = require("../../models");
const response = require("../../../utils/formatResponse"); 
const { Op } = require('sequelize');
const helper = require('../../../utils/helpers');

module.exports = {
    getCategories: async (req, res) => {
        try {
            const categories = await category.findAll();
            if (!categories) { return response(res, 404, false, 'Rincian kategori tidak ditemukan', categories) }
            return response(res, 200, true, 'Berhasil', categories);
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Server Internal lagi error nih", null);
        }
    },
    getProduct: async (req, res) => {
        try {
            const id = req.params.id;
            const productData = await product.findOne({ 
                where: {  id: id, is_release: true },
                include: [
                    { model: user, attributes: ['id', 'email'], include: { model: user_detail, attributes: ['name','city', 'image']} },
                    { model: category, attributes: ['id', 'name'] , through: { attributes: [] } }
                ],
            })
            
            if (!productData) { return response(res, 404, false, 'Produk tidak ditemukan', null) }
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
    getProducts: async (req, res) => {
        try {
            const category_id = req.query.category_id
            const search = req.query.search || ''
            const page = parseInt(req.query.page) || 1
            if (page < 1) {
                return response(res, 400, false, 'Halaman harus bilangan bulat lebih besar dari 0', null)
            }
            const limit = parseInt(req.query.limit) || 12
            const offset = (parseInt(page) - 1) * limit
            var query = {} 
            if (category_id) {
                query = {
                    where: {
                        [Op.or]: [
                            { name: { [Op.iLike]: `%${search}%` } },
                            { description: { [Op.iLike]: `%${search}%` } }
                        ],
                        status: true,
                        is_release: true,
                    },
                    attributes: ['id', 'name', 'price', 'description', 'images_url'],
                    limit: limit,
                    offset: offset,
                    distinct: true,
                    include: [
                        { model: category, attributes: ['id', 'name'] , through: { attributes: [] },  where: { id: category_id } },
                    ]
                }
            } else {
                query = {
                    attributes: ['id', 'name', 'price', 'description', 'images_url', 'user_id'],
                    limit: limit,
                    offset: offset,
                    distinct: true,
                    include: [
                        { model: category, attributes: ['id', 'name'] , through: { attributes: [] } }
                    ],
                    where: {
                        [Op.or]: [
                            { name: { [Op.iLike]: `%${search}%` } },
                            { description: { [Op.iLike]: `%${search}%` } }
                        ],
                        [Op.and]: [
                            { status: true },
                            { is_release: true }
                        ]
                    },
                }
            }
            const productData = await product.findAndCountAll(query)
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
    getProductsSeller: async (req, res) => {
        try {
            const QFilter = req.query.filter || 1
            const arrayFilter = [1, 2, 3]
            const filter = helper.slice(arrayFilter, [QFilter])[0]
            const seller_id = req.params.seller_id
            if(!filter){
                return response(res, 400, false, "Filter tidak tersedia", null)
            }
            const page = parseInt(req.query.page) || 1
            if (page < 1) {
                return response(res, 400, false, 'Halaman harus lebih besar dari 0', null)
            }
            const limit = parseInt(req.query.limit) || 12
            const offset = (parseInt(page) - 1) * limit
            
            var dataSearch = {
                limit: limit,
                offset: offset,
                distinct: true,
                is_release: true,
                include:  [
                    { model: category, attributes: ['id', 'name'] , through: { attributes: [] } }
                ],
                where: { 
                    user_id: seller_id
                },
                order: [
                    ["status", "DESC"]
                ]
            }
            if(filter == 2){ // available
                dataSearch.where.status = true 
            } else if(filter == 3) {  
                dataSearch.where.status = false 
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
    }
}