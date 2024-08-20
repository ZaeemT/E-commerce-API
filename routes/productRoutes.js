const express = require('express')
const router = express.Router()

const { createProduct, getAllProducts, getSingleProduct } = require('../controllers/productControllers')
const { authenticateUser, authorizePermissions } = require('../middlewares/authenticate')

router.get('/all_products', authenticateUser, authorizePermissions('admin'), getAllProducts)
router.post('/create_product', authenticateUser, authorizePermissions('vendor', 'admin'), createProduct)

router.route('/:id')
    .get(getSingleProduct)

module.exports = router
