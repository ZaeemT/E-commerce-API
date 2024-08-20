const express = require('express')
const router = express.Router()

const { authenticateUser, authorizePermissions } = require('../middlewares/authenticate')
const { createOrder } = require('../controllers/orderController')

router.post('/create_order', authenticateUser, authorizePermissions('admin', 'customer'), createOrder )

module.exports = router