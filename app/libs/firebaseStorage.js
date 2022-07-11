
const { ref, uploadBytes, deleteObject } =  require("firebase/storage")
const { storage } = require("../../config/firebaseConfig")
var path = require('path');
global.XMLHttpRequest = require("xhr2")
const env = process.env.NODE_ENV || 'development';

const uploudImage = async (req) => {
    
    // Grab the file
    const file = req.file;
    // Format the filename
    const fileName = req.user.id + '_' + Date.now() + '_' +  Math.floor(Math.random() * 100000) + path.extname(file.originalname)
    // Step 1. Create reference for file name in cloud storage 
    const pathReference = (env == 'development') ? 'images/local/' + fileName : 'images/' + fileName 
    const imageRef = ref(storage, pathReference)
    // Step 2. Upload the file in the bucket storage
    return await uploadBytes(imageRef, file.buffer, { contentType: 'image/jpeg' })
    
}

const deleteImage = async (url) => {
    const pathReference = (env == 'development') ? 'images/local/' + url : 'images/' + url 
    const imageRef = ref(storage, pathReference)
    return await deleteObject(imageRef)
}

module.exports = { uploudImage, deleteImage }