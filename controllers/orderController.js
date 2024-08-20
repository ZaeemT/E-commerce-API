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

module.exports = { createOrder }