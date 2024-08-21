const express = require('express')
const router = express.Router()

const { authenticateUser, authorizePermissions } = require('../middlewares/authenticate')
const { 
    createOrder, 
    getAllOrders, 
    getCustomersOrder, 
    getSingleOrder, 
    updateOrderItemStatus, 
    getVendorOrder, 
    deleteOrder } = require('../controllers/orderController')

router.post('/create_order', authenticateUser, authorizePermissions('admin', 'customer'), createOrder )
router.get('/all_orders_admin', authenticateUser, authorizePermissions('admin'), getAllOrders )
router.get('/all_orders_customer', authenticateUser, authorizePermissions('admin', 'customer'), getCustomersOrder )
router.get('/vendor_orders', authenticateUser, authorizePermissions('admin', 'vendor'), getVendorOrder )
router.put('/vendor_orders_status', authenticateUser, authorizePermissions('admin', 'vendor'), updateOrderItemStatus )
router.get('/:id', getSingleOrder)
router.delete('/:id', authenticateUser, authorizePermissions('admin'), deleteOrder )

module.exports = router