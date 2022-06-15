var express = require('express');
var router = express.Router();
const response = require('../utils/formatResponse');
const errorHandleJWT = require('../app/libs/errorHandlePassport');

const auth = require('../app/middlewares/auth');
const userController = require("../app/controllers/userController")
const authController = require('../app/controllers/authController');
const { uploudSingle, uploadMultiple } = require('../app/middlewares/multer');

/* API home */
router.get('/', function(req, res, next) {
  response(res, 200, true, 'Welcome to Second Hand App', null)
});

/* API Auth */
router.post('/register', authController.postRegister);
router.post('/login', authController.postLogin);
// router.post("/forgot-password", authController.postForgotPassword);
// router.post("/reset-password", authController.postResetPassword);

router.put('/user-detail', auth, uploudSingle, userController.putUserDetail);
router.get('/user-detail', auth, userController.getUserDetail);

// router.get('/usergame/:id', auth, userController.getId)
// router.get('/usergameapi',  auth, userController.getAllApi)
// router.post('/usergameapi', auth, userController.Post)
// router.put('/usergameapi/:id', auth, userController.Put)
// router.delete('/usergame/:id', auth, userController.Delete)


router.use(errorHandleJWT)

module.exports = router;
