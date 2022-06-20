const { user, user_detail, product, product_to_category, image, category, sequelize } = require("../models");
const response = require("../../utils/formatResponse"); 
const { Op } = require('Sequelize');

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
    },
    getProduct: async (req, res) => {
        try {
            const id = req.params.id;
            const productData = await product.findOne({ 
                where: { id: id },
                include: [
                    { model: user, attributes: ['id', 'email'] },
                    { model: category, attributes: ['id', 'name'] , through: { attributes: [] } }
                ],
            })
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
    // TODO : Masih ada bug di count
    getProducts: async (req, res) => {
        try {
            const category_id = req.query.category_id
            const search = req.query.search || ''
            // Setup Pagination
            const page = parseInt(req.query.page) || 1
            if (page < 1) {
                return response(res, 400, false, 'Page must be integer greater than 0', null)
            }
            const limit = 12
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
                    attributes: ['id', 'name', 'price', 'description', 'images_url'],
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
            console.log(productData);
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