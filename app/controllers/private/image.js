const { image } = require("../../models")
const response = require("../../../utils/formatResponse")
const { uploudImage, deleteImage} = require("../../libs/firebaseStorage")

module.exports = {
    /* Image */  
    postImage: async (req, res) => {
        try {
            const uploud = await uploudImage(req)
            const imageData = await image.create({ url: uploud.metadata.name })
            if (imageData) { return response(res, 200, true, 'Image Uploaded!', { url : imageData.url }) }
            return response(res, 400, false, 'Upload failed!', null)
        } catch (error) {
            console.log(error)
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
            const idUserInImage = parseInt(urlArray[0])
            if (idUserInImage !== jwtData.id) { return response(res, 400, false, 'You are not authorized to delete this image', null) }
            const imageData = await image.findOne({ where: { url: url } })
            if (!imageData) { return response(res, 404, false, 'Image not found', null) }
            const deletedImage = await imageData.destroy()
 
            if (deletedImage) { 
                deleteImage(url)
                return response(res, 200, true, 'Image Deleted!', null) 
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
}