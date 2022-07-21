const { product, notification, notification_category } = require("../../models")
const response = require("../../../utils/formatResponse")

/* Notification */
module.exports = {
    getAllNotifByUser: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1
            if (page < 1) {
                return response(res, 400, false, 'Halaman harus bilangan bulat lebih besar dari 0', null)
            }
            const limit = parseInt(req.query.limit) || 12
            const offset = (parseInt(page) - 1) * limit

            const notifData = await notification.findAndCountAll({
                limit: limit, offset: offset,
                where : { user_id: req.user.id},
                include : [
                    { model: product, attributes: ['name', 'price', 'images_url']},
                    { model: notification_category,as: 'category', attributes: ['title'] }, 
                ],
                order: [
                    ['created_at', 'DESC']
                ]
            })
            notifData.limit = limit
            notifData.totalPage = Math.ceil(notifData.count / limit)
            notifData.page = parseInt(page)
            notifData.nextPage = page < notifData.totalPage ? parseInt(page) + 1 : null
            notifData.prevPage = page > 1 ? parseInt(page) - 1 : null
            return response(res, 200, true, "Berhasil", notifData)
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Server Internal lagi error nih", null);
        }
    },
    patchNotifChecked: async (req, res) => {
        try {
            const id = req.params.id
            console.log("Cek");
            const notifData = await notification.findOne({ where: { id: id, user_id: req.user.id} })
            console.log(notifData);
            if(!notifData){ return response(res, 404, false, 'Notifikasi tidak ditemukan') }
            const updateData = await notifData.checked()
            return response(res, 200, true, "Berhasil", updateData)
        } catch (error) {
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            } else if(error.name === 'SequelizeValidationError') {
                return response(res, 400, false, error.errors[0].message, null);
            } else {
                return response(res, 500, false, "Server Internal lagi error nih", null);
            }
        }
    },
    deleteAllNotification: async (req,res) => {
        try {
            const destroy = await notification.destroy({
                where: { user_id: req.user.id },
            })
            return response(res, 200, false, "Berhasil menghapus notification", null)
        } catch (error) {
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            } else {
                return response(res, 500, false, "Internal Server Error", null);
            }
        }
    }

}