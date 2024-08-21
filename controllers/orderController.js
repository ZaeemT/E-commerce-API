const mongoose = require('mongoose')

const Order = require('../models/orderModel')
const Product = require('../models/productModel')

const createOrder = async(req, res) => {
    const { orderItems, paymentStatus } = req.body;

    try {
        // Calculate the total price
        let totalPrice = 0;
        for (let item of orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                totalPrice += product.price * item.quantity;
            } else {
                return res.status(400).json({ message: `Product not found: ${item.product}` });
            }
        }

        const order = await Order.create({
            customer: req.user.id,
            orderItems,
            totalPrice,
            paymentStatus,
        });

        res.status(201).json(order);
    } catch (err) {
        res.status(400).json({ message: 'Error creating order', error: err.message });
    }
}

// Get all orders for admin
const getAllOrders = async(req, res) => {
    try {
        const orders = await Order.find({}).populate('orderItems.product', 'name price')
        res.status(200).json(orders)
    } 
    catch (err) {
        res.status(400).json({ message: 'Could not find orders' })
    }   
}

// Get all orders for logged-in customer
const getCustomersOrder = async(req, res) => {
    try {
        const orders = await Order.find({ customer: req.user.id }).populate('orderItems.product', 'name price');
        res.json(orders);
    } catch (err) {
        res.status(400).json({ message: 'Error fetching orders', error: err.message });
    }
}

// Get a specific order by id
const getSingleOrder = async(req, res) => {
    try {
        const order = await Order.findById(req.params.id)
          .populate('orderItems.product', 'name price')
          .populate('customer', 'name email');
        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: 'Error fetching order', error: err.message });
    }
}

// Vendor can update the order status
const updateOrderStatus = async(req, res) => {
    const { orderStatus } = req.body;

    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
        return res.status(404).json({ message: 'Order not found' });
        }

        order.orderStatus = orderStatus || order.orderStatus;
        const updatedOrder = await order.save();

        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ message: 'Error updating order status', error: err.message });
    }
}

// Logged-in vendor can get his/her products that were ordered
const getVendorOrder = async(req, res) => {
    try {
        // Find orders containing products from the logged-in vendor
        const orders = await Order.find({
          'orderItems.product': { $exists: true },
        }).populate({
          path: 'orderItems.product',
          select: 'name price vendor',
          match: { vendor: req.user.id }, // Match products that belong to the logged-in vendor
        });
    
        // Filter out products that don't belong to the vendor
        const vendorOrders = orders.map(order => {
            const filteredOrderItems = order.orderItems.filter(item => item.product && item.product.vendor.toString() === req.user.id);

            const { totalPrice, ...orderWithoutTotalPrice } = order._doc;

            return { ...orderWithoutTotalPrice, orderItems: filteredOrderItems };

        }).filter(order => order.orderItems.length > 0);
    
        res.json(vendorOrders);
    } catch (err) {
        res.status(400).json({ message: 'Error fetching vendor orders', error: err.message });
    }
}


// Only admin can delete order
const deleteOrder = async(req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({error: 'No such order'}) 
        }

        const order = await Order.findOneAndDelete({_id: id})

        if (!order) {
            return res.status(404).json({error: 'No such order'})
        }
    
        res.status(200).json({ message: 'Order deleted' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

module.exports = { createOrder, getAllOrders, getCustomersOrder, getSingleOrder, updateOrderStatus, getVendorOrder, deleteOrder }