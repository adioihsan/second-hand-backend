const { user, user_detail, product, negotiation, notification } = require("../../models")
const response = require("../../../utils/formatResponse")
const { Op } = require('sequelize')
const Constant = require('../../../utils/constant')

module.exports = {
    /* Negotiation */
    postNegotiation: async (req,res) => {
        try {
            const jwtData = req.user
            const { product_id, nego_price } = req.body

            const userDetailData = await user_detail.findOne({ where: { user_id: jwtData.id} })
            if (!userDetailData.name || !userDetailData.address || !userDetailData.phone) {
                return response(res, 400, false, 'Tolong lengkapi profil kamu dulu yah.', null)
            }
            const productData = await product.findOne({
                where: { 
                    id: product_id,
                    status: true,
                    is_release: true,
                    [Op.not] : { user_id: req.user.id }
                }
            }) 

            if(!productData) { 
                return response(res, 404, false, "Produk tidak ditemukan!", null)
            } else if(productData.status === false) {
                return response(res, 404, false, "Produk tidak tersedia!", null)
            }

            const negotiationData = await negotiation.findOne({ where: { 
                user_id_buyer: req.user.id,
                product_id: product_id,
            } })

            if(negotiationData) {
                if (negotiationData.status == Constant.PENDING) {
                    return response(res, 400, false, "Tunggu respon dari penjual terlebih dahulu", null)
                } else if (negotiationData.status == Constant.ACCEPTED) {
                    return response(res, 401, false, "Negosiasi telah diterima, silahkan hubungi penjual!", null)
                } else if (negotiationData.status == Constant.REJECTED) {
                    const negoUpdate = await negotiationData.update({ price: nego_price, status: Constant.PENDING })
                    await notification.add({
                        category_id: 2,
                        product_id: productData.id,
                        user_id: productData.user_id,
                        price: productData.price,
                        nego_price: nego_price,
                        status: Constant.PENDING
                    })
                    return response(res, 200, false, "Harga tawaranmu berhasil dikirim ke penjual", negoUpdate)
                } 
            }
            const negoData =  await negotiation.create({
                user_id_buyer: jwtData.id,
                product_id: productData.id,
                price: nego_price,
                status: Constant.PENDING
            })
            // Notification to Seller
            await notification.add({
                category_id: 2,
                product_id: negoData.id,
                user_id: productData.user_id,
                price: productData.price,
                nego_price: nego_price,
                status: Constant.PENDING
            })
            return response(res, 200, true, "Berhasil", negoData)
        } catch (error) {
            console.log(error)
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

    getNegotiation: async (req, res) => {
        try {
            const id = req.params.id;
            const negotiationData = await negotiation.findOne({
                where: { id: id }
            })
            if (!negotiationData) { return response(res, 404, false, 'Tidak ditemukan', null) }
            else if (negotiationData.user_id_buyer !== req.user.id) { 
                return response(res, 403, false, 'Dilarang', null)
            }
            
            return response(res, 200, false, "Berhasil", negotiationData)

        } catch (error) {
            console.log(error)
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null)
            } else {
                return response(res, 500, false, "Server Internal lagi error nih", null)
            }
        }
    },  

    getBuyerNegotiations: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1
            if (page < 1) {
                return response(res, 400, false, 'Halaman harus bilangan bulat lebih besar dari 0', null)
            }
            const limit = parseInt(req.query.limit) || 12
            const offset = (parseInt(page) - 1) * limit
            const negotiationsData = await negotiation.findAndCountAll({
                limit: limit, offset: offset, distinct: true,
                where: {
                    user_id_buyer: req.user.id
                },
                include: [{ 
                    model: product, 
                    attributes: ['id', 'name', 'price', 'images_url', 'user_id']
                }, {
                    model: user, as: 'user_buyer', attributes: ['id'], include: {
                        model: user_detail,
                        attributes: ['name', 'city', 'image', 'phone']
                    }
                }]
            })
            negotiationsData.limit = limit
            negotiationsData.totalPage = Math.ceil(negotiationsData.count / limit)
            negotiationsData.page = parseInt(page)
            negotiationsData.nextPage = page < negotiationsData.totalPage ? parseInt(page) + 1 : null
            negotiationsData.prevPage = page > 1 ? parseInt(page) - 1 : null
            return response(res, 200, true, "Berhasil", negotiationsData)
        } catch (error) {
            console.log(error)
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null)
            } else {
                return response(res, 500, false, "Server Internal lagi error nih", null)
            }
        }
    },

    getSellerNegotiations: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1
            if (page < 1) {
                return response(res, 400, false, 'Halaman harus bilangan bulat lebih besar dari 0', null)
            }
            const status = req.query.filter

            const limit = parseInt(req.query.limit) || 12
            const offset = (parseInt(page) - 1) * limit
            const dataFind = {
                attributes: ['id', 'user_id_buyer', 'product_id', 'price', 'status', 'updatedAt'],
                include: [
                    { 
                        model: product, 
                        attributes: ['id', 'name', 'price', 'images_url', 'user_id'],
                        where: {  user_id: req.user.id }
                    }, 
                    {
                        model: user, as: 'user_buyer', attributes: ['id'], include: [{
                            model: user_detail,
                            attributes: ['name', 'city', 'image', 'phone']
                        }],
                    }
                ],
                limit: limit, offset: offset, distinct: true,
            }
            if (status) { dataFind.where = { status: status } } 
            const negotiationsData = await negotiation.findAndCountAll(dataFind)
            negotiationsData.limit = limit
            negotiationsData.totalPage = Math.ceil(negotiationsData.count / limit)
            negotiationsData.page = parseInt(page)
            negotiationsData.nextPage = page < negotiationsData.totalPage ? parseInt(page) + 1 : null
            negotiationsData.prevPage = page > 1 ? parseInt(page) - 1 : null
            return response(res, 200, true, 'Berhasil', negotiationsData)
        } catch (error) {
            console.log(error)
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null)
            } else {
                return response(res, 500, false, "Server Internal lagi error nih", null)
            }
        }
    },

    patchSellerConfirmNegotiation: async (req, res) => {
        try {
            const id  = req.params.id
            const negotiationData = await negotiation.findOne({
                where: {  id: id, status: Constant.PENDING },
                include: [{ 
                    model: product,
                    attributes: ['id', 'name', 'price', 'images_url', 'user_id']
                }, { 
                    model: user, as: 'user_buyer', attributes: ['id'], include: {
                        model: user_detail,
                        attributes: ['name', 'city', 'image', 'phone']
                    }
                }]
            })
            if (!negotiationData) {
                return response(res, 404, false, 'Tawaran tidak ditemukan', null)
            } else if (negotiationData.product.user_id !== req.user.id) {
                return response(res, 403, false, 'Akses Dibatasi', null)
            }
            // Notif to Buyer
            await notification.add({
                category_id: 2,
                product_id: negotiationData.id,
                user_id: negotiationData.user_id_buyer,
                price: negotiationData.price,
                nego_price: negotiationData.nego_price,
                status: Constant.ACCEPTED
            })
            const updateData = await negotiationData.update({ status: Constant.ACCEPTED })

            return response(res, 200, true, 'Negosiasi berhasil, silahkan ubah status produk!', updateData)
        } catch (error) {
            console.log(error)
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

    patchSellerRejectNegotiation: async (req, res) => {
        try {
            const id  = req.params.id
            const negotiationData = await negotiation.findOne({
                where: {  
                    id: id, 
                    status: Constant.PENDING, 
                },
                include: [{ 
                    model: product,
                    attributes: ['id', 'name', 'price', 'images_url', 'user_id']
                }, { 
                    model: user, as: 'user_buyer', attributes: ['id'], include: {
                        model: user_detail,
                        attributes: ['name', 'city', 'image', 'phone']
                    }
                }]
            })
            if (!negotiationData) {
                return response(res, 404, false, 'Tawaran tidak ditemukan', null)
            } else if (negotiationData.product.user_id !== req.user.id) {
                return response(res, 403, false, 'Akses Dibatasi', null)
            }
            const updateData = await negotiationData.update({ status: Constant.REJECTED })
            // Notifi buyer
            await notification.add({
                category_id: 2,
                product_id: negotiationData.id,
                user_id: negotiationData.user_id_buyer,
                price: negotiationData.price,
                nego_price: negotiationData.nego_price,
                status: Constant.REJECTED
            })
            return response(res, 200, true, 'Negosiasi ditolak', updateData)
        } catch (error) {
            console.log(error)
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
}