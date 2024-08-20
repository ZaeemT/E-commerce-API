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


module.exports = { createOrder, getAllOrders }