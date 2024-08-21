const express = require('express')
const router = express.Router()

const { authenticateUser, authorizePermissions } = require('../middlewares/authenticate')
const { createOrder, getAllOrders, getCustomersOrder, getSingleOrder, updateOrderStatus, getVendorOrder, deleteOrder } = require('../controllers/orderController')

router.post('/create_order', authenticateUser, authorizePermissions('admin', 'customer'), createOrder )
router.get('/all_orders_admin', authenticateUser, authorizePermissions('admin'), getAllOrders )
router.get('/all_orders_customer', authenticateUser, authorizePermissions('admin', 'customer'), getCustomersOrder )
router.get('/vendor_orders', authenticateUser, authorizePermissions('admin', 'vendor'), getVendorOrder )
router.get('/:id', getSingleOrder)
router.put('/:id/status', authenticateUser, authorizePermissions('admin', 'vendor'), updateOrderStatus )
router.delete('/:id', authenticateUser, authorizePermissions('admin'), deleteOrder )
// TODO: make an api so vendor can view the orders they have.

module.exports = router