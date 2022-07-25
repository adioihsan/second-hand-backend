
const { app } = require("../../config/firebaseConfig")
var path = require('path');
global.XMLHttpRequest = require("xhr2")

const uploudImage = async (req) => {
    
    // Grab the file
    const file = req.file;
    // Format the filename
    const fileName = req.user.id + '_' + Date.now() + '_' +  Math.floor(Math.random() * 100000) + path.extname(file.originalname)
    // Step 1. Create reference for file name in cloud storage 
    const pathReference = `images/${fileName}`
    // Step 2. Upload the file in the bucket storage
    await app.storage().bucket().file(pathReference).save(file.buffer, { contentType: 'image/jpeg' })
    // Step 3. Return the url of the image
    await app.storage().bucket().file(pathReference).makePublic()
    const url = app.storage().bucket().file(pathReference).publicUrl()

    // TODO : Add the url to the database table image
    
    return {
        url: url,
        metadata: { name: fileName }
    }
}

const deleteImage = async (filename) => {
    const pathReference = `images/${filename}` 
    return await app.storage().bucket().file(pathReference).delete()
}

module.exports = { uploudImage, deleteImage }