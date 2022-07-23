const { image } = require("../../models")
const response = require("../../../utils/formatResponse")
const { uploudImage, deleteImage} = require("../../libs/firebaseStorage")

module.exports = {
    /* Image */  
    postImage: async (req, res) => {
        try {
            const uploud = await uploudImage(req)
            const imageData = await image.create({ url: uploud.metadata.name })
            if (imageData) { return response(res, 200, true, 'Upload foto!', { url : imageData.url }) }
            return response(res, 400, false, 'Gagal upload!', null)
        } catch (error) {
            console.log(error)
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Server Internal lagi error nih", null);
        }
    },
    deleteImage: async (req, res) => {
        try {
            const jwtData = req.user; 
            const { url } = req.body
            console.log(url);
            if (!url) { return response(res, 400, false, 'Url tidak ada!', null) }
            const urlArray = url.split("_") 
            const idUserInImage = parseInt(urlArray[0])
            if (idUserInImage !== jwtData.id) { return response(res, 400, false, 'Kamu belum terotorisasi untuk menghapus foto ini', null) }
            const imageData = await image.findOne({ where: { url: url } })
            if (!imageData) { return response(res, 404, false, 'Foto tidak ditemukan', null) }
            const deletedImage = await imageData.destroy()
 
            if (deletedImage) { 
                deleteImage(url)
                return response(res, 200, true, 'Foto terhapus!', null) 
            }
            return response(res, 400, false, 'Gagal hapus!', null)
        } catch (error) {
            console.log(error);
            if (error.name === 'SequelizeDatabaseError') {
                return response(res, 400, false, error.message, null);
            }
            return response(res, 500, false, "Server Internal lagi error nih", null);
        }
    },
}