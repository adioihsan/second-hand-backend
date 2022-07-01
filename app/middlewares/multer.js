const multer = require('multer');
const path = require("path");

// get user id from token
const getUserId = (req) => {
    const jwtData = req.user;
    return jwtData.id;
}

// Set Storage Engine
const storage = multer.diskStorage({
    destination: "public/images/",
    filename: (req, file, cb) => {
        cb(null, getUserId(req) + '_' + Date.now() + '_' +  Math.floor(Math.random() * 100000) + path.extname(file.originalname));
    },
});

//  Check file Type
function checkFileType(file, cb) {
    // Allowed ext
    const fileTypes = /jpeg|jpg|png|gif|svg/;
    // Check ext
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimeType = fileTypes.test(file.mimetype);
  
    if (mimeType && extName) {
      return cb(null, true);
    } else {
        // new error
        const error = new Error("ErrorInputExtension");
        // return error
        return cb(error, false);
    }
  }

const uploudSingle = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    },
}).single("image"); // name of input file

const uploadMultiple = multer({
    storage: storage,
    limits: { fileSize: 1500000 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).array("images", 5); // name of input file


module.exports = { uploudSingle, uploadMultiple };
    