var express = require('express');
var router = express.Router();
const response = require('../utils/formatResponse');
const errorHandleJWT = require('../app/libs/errorHandlePassport');

const auth = require('../app/middlewares/auth');
const userController = require("../app/controllers/userController")
const authController = require('../app/controllers/authController')
const { uploudSingle, uploadMultiple } = require('../app/middlewares/multer')

/* API home */
router.get('/', function(req, res, next) {
  response(res, 200, true, 'Welcome to Second Hand App', null)
});

/* API Auth */
router.post('/register', authController.postRegister);
router.post('/login', authController.postLogin);
router.post("/forgot-password", authController.postForgotPassword);  // TODO: send email dengan isi otp
router.post("/reset-password", authController.postResetPassword);    // TODO: reset password dengan mencocokan otp

router.put('/user-detail', auth, uploudSingle, userController.putUserDetail);
router.get('/user-detail', auth, userController.getUserDetail);
// router.post('/product', auth, uploadMultiple, userController.postProduct);   // TODO: insert product dan upload multiple image
// router.put('/product/:id', auth, uploadMultiple, userController.putProduct); // TODO: update product dan upload multiple image, kalau bisa dihapus image yang diganti
// router.get('/product/:id', auth, userController.getProduct);         // TODO: get product by id
// router.delete('/product/:id', auth, userController.deleteProduct);   // TODO: delete product by id
// router.get('/products', auth, userController.getProducts);           // TODO: get all product dengan filter category dan sear


router.use(errorHandleJWT)

module.exports = router;
