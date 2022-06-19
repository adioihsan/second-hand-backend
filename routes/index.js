var express = require('express');
var router = express.Router();
const response = require('../utils/formatResponse');
const errorHandleJWT = require('../app/libs/errorHandlePassport');

const auth = require('../app/middlewares/auth');
const userController = require("../app/controllers/userController")
const categoriesController = require("../app/controllers/categoriesController")
const authController = require('../app/controllers/authController')
const { uploudSingle, uploadMultiple } = require('../app/middlewares/multer')

/* API home */
router.get('/', function(req, res, next) {
  response(res, 200, true, 'Welcome to Second Hand App', null)
});

/* API Auth */
router.post('/register', authController.postRegister);
router.post('/login', authController.postLogin);
router.post("/forgot-password", authController.postForgotPassword); 
router.post("/reset-password", authController.postResetPassword);    

router.put('/user-detail', auth, uploudSingle, userController.putUserDetail);
router.get('/user-detail', auth, userController.getUserDetail);

router.post('/product', auth, uploadMultiple, userController.postProduct);   
router.put('/product/:id', auth, uploadMultiple, userController.putProduct); // TODO: update product dan upload multiple image, kalau bisa dihapus image yang diganti
router.delete('/product/:id', auth, userController.deleteProduct); 
  
router.get('/product/:id', userController.getProduct);         
router.get('/products', userController.getProducts);  

router.get('/categories', auth, categoriesController.getCategories)

router.use(errorHandleJWT)

module.exports = router;
