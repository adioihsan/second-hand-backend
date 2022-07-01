const { user, user_detail, product, product_to_category, image, category, wishlist, negotiation, notification } = require("../../models");
const response = require("../../../utils/formatResponse"); 
const fs = require("fs");
const { Op, where } = require('sequelize');
const helper = require('../../../utils/helpers');

module.exports = {
    /* Negotiation */
    postNegotiation: async (req,res) => {
        try {
            const jwtData = req.user
            const { product_id, price } = req.body

            const userDetailData = await user_detail.findOne({ where: { user_id: jwtData.id} })
            if (!userDetailData.name || !userDetailData.address || !userDetailData.phone) {
                return response(res, 400, false, 'Please complete your profile first.', null)
            }
            const productData = await product.findOne({
                where: { 
                    id: product_id,
                    status: true,
                    is_release: true,
                    [Op.not] : {
                        user_id: req.user.id
                    }
                }
            }) 

            if(!productData) { 
                return response(res, 404, false, "Produk tidak ditemukan!", null)
            } else if(productData.status === false) {
                return response(res, 404, false, "Produk tidak tersedia!", null)
            }

            const negotiationData = await negotiation.findOne({ where: { user_id_buyer: req.user.id } })
            if (negotiationData.status == 1 ) {
                return response(res, 400, false, "Tunggu respon dari penjual terlebih dahulu", null)
            } else if (negotiationData.status == 2) {
                return response(res, 401, false, "Negosiasi telah diterima, silahkan hubungi penjual!", null)
            } else if (negotiationData.status == 3) {
                const negoUpdate = await negotiationData.update({ price: price, status: 1 })
                // TODO : Tambahkan Notification
                return response(res, 200, false, "Harga tawaranmu berhasil dikirim ke penjual", negoUpdate)
            }

            const negoData =  await negotiation.create({
                user_id_buyer: jwtData.id,
                product_id: productData.id,
                price: price,
                status: 1
            })
            // TODO : Tambahkan Notification
            // const notif = await notification.create({
            //     product_id: negoData.product_id,
            //     category_id: 2,
            //     nego_price: negoData.price
            // })

            if(!negoData) { return response(res, 400, false, "Gagal melakukan negosiasi", null) }
            
            return response(res, 200, true, "Success", negoData)
        } catch (error) {
            console.log(error)
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

    getNegotiation: async (req, res) => {
        try {
            const id = req.params.id;
            const negotiationData = await negotiation.findOne({
                where: { id: id }
            })
            if (!negotiationData) { return response(res, 404, false, 'Not Found', null) }
            else if (negotiationData.user_id_buyer !== req.user.id) { 
                return response(res, 403, false, 'Forbidden', null)
            }
            
            return response(res, 200, false, "Sukses", negotiationData)

        } catch (error) {
            console.log(error)
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null)
            } else {
                return response(res, 500, false, "Internal Server Error", null)
            }
        }
    },  

    getBuyerNegotiations: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1
            if (page < 1) {
                return response(res, 400, false, 'Page Harus bilangan bulat lebih besar dari 0', null)
            }
            const limit = parseInt(req.query.limit) || 12
            const offset = (parseInt(page) - 1) * limit
            const negotiationsData = await negotiation.findAndCountAll({
                limit: limit, offset: offset,
                where: {
                    user_id_buyer: req.user.id
                }
            })
            negotiationsData.limit = limit
            negotiationsData.totalPage = Math.ceil(negotiationsData.count / limit)
            negotiationsData.page = parseInt(page)
            negotiationsData.nextPage = page < negotiationsData.totalPage ? parseInt(page) + 1 : null
            negotiationsData.prevPage = page > 1 ? parseInt(page) - 1 : null
            return response(res, 200, true, "Sukses", negotiationsData)
        } catch (error) {
            console.log(error)
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null)
            } else {
                return response(res, 500, false, "Internal Server Error", null)
            }
        }
    },

    getSellerNegotiations: async (req, res) => {
        try {
            const negotiationsData = await negotiation.findAndCountAll({ 
                attributes: ['id', 'user_id_buyer', 'product_id', 'price', 'status', 'updatedAt'],
                include: [{ 
                    model: product, 
                    attributes: ['id', 'name', 'price', 'images_url', 'user_id'],
                    where: {  user_id: req.user.id }
                },{
                    model: user, as: 'user_buyer', attributes: ['id'], include: {
                        model: user_detail,
                        attributes: ['name', 'city', 'image', 'phone']
                    }
                }],
                where: { status: 1 }
            })
            return response(res, 200, true, 'Sukses', negotiationsData)
        } catch (error) {
            console.log(error)
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null)
            } else {
                return response(res, 500, false, "Internal Server Error", null)
            }
        }
    },

    patchSellerConfirmNegotiation: async (req, res) => {
        try {
            const id  = req.params.id
            const negotiationData = await negotiation.findOne({
                where: { 
                    id: id,
                    status: 1
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
            const updateData = await negotiationData.update({ status: '2' })
            // TODO : Tambahkan Notification Accept
            return response(res, 200, true, 'Sukses', updateData)
        } catch (error) {
            console.log(error)
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
    patchSellerRejectNegotiation: async (req, res) => {
        try {
            const id  = req.params.id
            const negotiationData = await negotiation.findOne({
                where: {  id: id, status: 1 },
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
            const updateData = await negotiationData.update({ status: '3' })
            // TODO: Tambahkan Notification Rejection Response
            return response(res, 200, true, 'Sukses', updateData)
        } catch (error) {
            console.log(error)
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
}