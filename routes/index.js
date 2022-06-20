var express = require('express');
var router = express.Router();
const response = require('../utils/formatResponse');
const errorHandleJWT = require('../app/libs/errorHandlePassport');

const auth = require('../app/middlewares/auth');
const privateController = require("../app/controllers/privateController")
const publicController = require("../app/controllers/publicController")
const authController = require('../app/controllers/authController')
const { uploudSingle, uploadMultiple } = require('../app/middlewares/multer')

/* API home */
router.get('/', function(req, res, next) {
  response(res, 200, true, 'Welcome to Second Hand App', null)
});

/**
 * Authentication API
 * 
 *
 * */
router.post('/register', authController.postRegister)
router.post('/login', authController.postLogin)
router.post("/forgot-password", authController.postForgotPassword)
router.post("/reset-password", authController.postResetPassword)    

/**
 *  Public API 
 * 
 *  No need to authenticate
 *  */ 
router.get('/categories', publicController.getCategories)

router.get('/product/:id', publicController.getProduct)         
router.get('/products', publicController.getProducts)  

/** 
 *  Private API 
 * 
 *  Need to be logged in to access this API, Using JWT Token added to Bearer Header
 * */
router.put('/user-detail', auth, uploudSingle, privateController.putUserDetail)
router.get('/user-detail', auth, privateController.getUserDetail)

router.post('/image', auth, uploudSingle, privateController.postImage)
router.delete('/image/:name', auth, privateController.deleteImage)

router.post('/product', auth, privateController.postProduct)   
router.delete('/product/:id', auth, privateController.deleteProduct) 
router.patch('/product/:id/release', auth, privateController.patchProductRelease)
router.patch('/product/:id/sold', auth, privateController.patchProductSold)
router.put('/product/:id', auth, privateController.putProduct) // TODO: update product dan upload multiple image, kalau bisa dihapus image yang diganti

// router.post("/wish", auth, privateController.postProductWishlist);           // TODO: Menambahkan wish berdasarkan user yang login dan product yang diinginkan (id product), jika sudah ada maka tidak ditambahkan, jika belum ada maka ditambahkan, dan jika product yang diinginkan tidak ada maka tidak ditambahkan atau status product false (not available)
// router.get("/wish/:id", auth, privateController.getProductWishlist);         // TODO: Mengambil wishlist berdasarkan id wishlist, authorized by user yang login, data include product dan user
// router.delete("/wish/:id", auth, privateController.deleteProductWishlist);   // TODO: Menghapus wishlist berdasarkan id wishlist, authorized by user yang login
/// router.get("/wishes", auth, privateController.getProductWishlistAll);        // TODO: Mengambil semua wishlist berdasarkan user yang login, authorized by user yang login

// router.post("/negotiation", auth, privateController.postNegotiation);    
// router.get("/negotiation", auth, privateController.getNegotiation);
// router.delete("/negotiation/:id", auth, privateController.deleteNegotiation);
// router.put("/negotiation/:id", auth, privateController.putNegotiation);
// router.get("/negotiations", auth, privateController.getNegotiationAll);

router.use(errorHandleJWT)

module.exports = router;
