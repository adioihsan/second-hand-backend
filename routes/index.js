var express = require('express');
var router = express.Router();
const response = require('../utils/formatResponse');
const errorHandleJWT = require('../app/libs/errorHandlePassport');

const auth = require('../app/middlewares/auth')
const { uploudSingle, uploadMultiple } = require('../app/middlewares/multer')

//Controller
const authPubCon = require('../app/controllers/public/auth');
const publicController = require("../app/controllers/public/index")

const userPvtCont = require('../app/controllers/private/user')
const imagePvtCont = require('../app/controllers/private/image')
const productPvtCont = require('../app/controllers/private/product')
const whistlistPvtCon = require('../app/controllers/private/whistlist')
const negotiationPvtCon = require('../app/controllers/private/negotiation')
const notificationPvtCon = require('../app/controllers/private/notification')


/* API home */
router.get('/', function(req, res, next) {
  response(res, 200, true, 'Welcome to Second Hand App', null)
});

/**
 * Authentication API
 * 
 *
 * */
router.post('/register', authPubCon.postRegister)
router.post('/login', authPubCon.postLogin)
router.post("/forgot-password", authPubCon.postForgotPassword)
router.post("/reset-password", authPubCon.postResetPassword)    

/**
 *  Public API 
 * 
 *  No need to authenticate
 *  */ 
router.get('/categories', publicController.getCategories)
router.get('/product/:id', publicController.getProduct)         
router.get('/products', publicController.getProducts)  
router.get('/:seller_id/products', publicController.getProductsSeller)

/** 
 *  Private API 
 * 
 *  Need to be logged in to access this API, Using JWT Token added to Bearer Header
 * */
router.put('/user-detail', auth, uploudSingle, userPvtCont.putUserDetail)
router.get('/user-detail', auth, userPvtCont.getUserDetail)
router.get("/profile", auth, userPvtCont.getProfile)

router.post('/image', auth, uploudSingle, imagePvtCont.postImage)
router.delete('/image', auth, imagePvtCont.deleteImage)

router.post('/product', auth, productPvtCont.postProduct)   
router.delete('/product/:id', auth, productPvtCont.deleteProduct) 
router.patch('/product/:id/release', auth, productPvtCont.patchProductRelease)
router.patch('/product/:id/sold', auth, productPvtCont.patchProductSold)
router.put('/product/:id', auth, productPvtCont.putProduct) 
router.get('/product/:id/me', auth, productPvtCont.getProduct)
router.get('/products/me', auth, productPvtCont.getSellerProduct)
router.get('/product/:id/negotiation', auth, productPvtCont.getProductNegotiattion)
router.get('/product/:id/wish', auth, productPvtCont.getProductWish)

router.post("/wish", auth, whistlistPvtCon.postProductWishlist);           
router.get("/wish/:id", auth, whistlistPvtCon.getProductWishlist);         
router.delete("/wish/:id", auth, whistlistPvtCon.deleteProductWishlist);   
router.get("/wishes", auth, whistlistPvtCon.getProductWishlistAll);        


/* Negotiate API */
router.post("/negotiation", auth, negotiationPvtCon.postNegotiation)    
router.get("/negotiation/:id", auth, negotiationPvtCon.getNegotiation)
router.patch("/negotiation/:id/confirm", auth, negotiationPvtCon.patchSellerConfirmNegotiation)
router.patch("/negotiation/:id/reject", auth, negotiationPvtCon.patchSellerRejectNegotiation)
router.get("/negotiations", auth, negotiationPvtCon.getBuyerNegotiations);
router.get("/negotiations/me", auth, negotiationPvtCon.getSellerNegotiations);
router.patch("/negotiation/:id", auth, negotiationPvtCon.patchNegotiation);

/* Negtification API */
router.get("/notifications", auth, notificationPvtCon.getAllNotifByUser)
router.patch("/notification/:id/checked", auth, notificationPvtCon.patchNotifChecked)
router.delete("/notifications", auth, notificationPvtCon.deleteAllNotification)

router.use(errorHandleJWT)

module.exports = router;
