const express = require('express')
const router = express.Router()

const { authenticateUser, authorizePermissions } = require('../middlewares/authenticate')
const { createOrder, getAllOrders, getCustomersOrder, getSingleOrder } = require('../controllers/orderController')

router.post('/create_order', authenticateUser, authorizePermissions('admin', 'customer'), createOrder )
router.get('/all_orders_admin', authenticateUser, authorizePermissions('admin'), getAllOrders )
router.get('/all_orders_customer', authenticateUser, authorizePermissions('admin', 'customer'), getCustomersOrder )
router.get('/:id', getSingleOrder)

module.exports = router