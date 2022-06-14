var express = require('express');
var router = express.Router();


const auth = require('../app/middlewares/auth');
const user = require("../app/controllers/userController")

const { register, loginAPI } = require('../app/controllers/auth_api');
router.post('/api/register', register);
router.post('/api/loginAPI', loginAPI);

router.get('/usergameapi',  auth, user.getAllApi)
router.get('/usergame/:id', auth, user.getId)
router.post('/usergameapi', auth, user.Post)
router.put('/usergameapi/:id', auth, user.Put)
router.delete('/usergame/:id', auth, user.Delete)

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
