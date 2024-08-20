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

module.exports = { createOrder, getAllOrders, getCustomersOrder, getSingleOrder, updateOrderStatus }