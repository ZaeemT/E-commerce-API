const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Order = require('../models/orderModel')

const path = require('path')
const fs = require('fs')

const generateOrderReceipt = require('../utils/pdfGenerator')
const sendOrderReceipt = require('../utils/emailSender')

const handlePayment = async (req, res) => {
    const { orderId, paymentMethod } = req.body

    try {
        // Find the order
        let order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ message: 'Order already paid' });
        }

        const totalAmountInCents = Math.round(order.totalPrice * 100);

        // Create a payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmountInCents, // Convert to smallest currency unit (cents for USD)
            currency: 'usd',
            payment_method: paymentMethod, // Pass the payment method ID from the frontend
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never'
            },
        });

        
        order.paymentIntentId = paymentIntent.id; // Store the payment intent ID

        order = await order.save();

        res.status(200).json({ clientSecret: paymentIntent.client_secret, order });
    } catch (err) {
        res.status(400).json({ message: 'Error processing payment', error: err.message });
    }
}

const confirmPayment = async(req, res) => {
    const { paymentIntentId } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            // Update the order status to paid
            let order = await Order.findOneAndUpdate(
                { paymentIntentId },
                { paymentStatus: 'paid' },
                { returnOriginal: false }
            );

            const receiptsDir = path.join(__dirname, '../receipts');
            if (!fs.existsSync(receiptsDir)) {
                fs.mkdirSync(receiptsDir, { recursive: true });
            }

            // Generate PDF receipt
            const filePath = path.join(__dirname, `../receipts/receipt-${order._id}.pdf`);
            generateOrderReceipt(order, filePath);

            // Send PDF receipt via email
            await sendOrderReceipt(req.user.email, filePath);

            // Delete the PDF file after sending the email
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file: ${filePath}`, err);
                } else {
                    console.log(`File deleted: ${filePath}`);
                }
            });

            res.json({ message: 'Payment confirmed and receipt emailed', order });
        } else {
            res.status(400).json({ message: 'Payment not confirmed', paymentIntent });
        }
    } catch (err) {
        res.status(400).json({ message: 'Error confirming payment', error: err.message });
    }
}
     
module.exports = { handlePayment, confirmPayment }