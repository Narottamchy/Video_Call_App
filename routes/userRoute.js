const express = require('express');
const router = express();

//using usercontroller getting the functionwhich will be performed by the router function at specific endpoints
const userController = require('../controllers/userController');

router.get('/',userController.loadIndex);

module.exports = router;