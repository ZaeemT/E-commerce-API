const express = require('express')
const router = express.Router()

const { createProduct, getAllProducts, getSingleProduct, updateProduct } = require('../controllers/productControllers')
const { authenticateUser, authorizePermissions } = require('../middlewares/authenticate')

router.get('/all_products', authenticateUser, authorizePermissions('admin'), getAllProducts)
router.post('/create_product', authenticateUser, authorizePermissions('vendor', 'admin'), createProduct)

router.route('/:id')
    .get(getSingleProduct)
    .put(authenticateUser, authorizePermissions('admin', 'vendor'), updateProduct)

module.exports = router
