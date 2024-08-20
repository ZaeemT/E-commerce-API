const express = require('express')
const router = express.Router()

const { createProduct } = require('../controllers/productControllers')
const { authenticateUser, authorizePermissions } = require('../middlewares/authenticate')

router.post('/create_product', authenticateUser, authorizePermissions('vendor'), createProduct)

module.exports = router
