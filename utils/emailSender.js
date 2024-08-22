const nodemailer = require('nodemailer')

const sendOrderReceipt = async (email, filePath) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.USER_EMAIL,
        to: email,
        subject: 'Your Order Receipt',
        text: 'Thank you for your order. Please find your order receipt attached.',
        attachments: [
            {
                filename: 'order-receipt.pdf',
                path: filePath,
            },
        ],
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Order receipt sent to:', email);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendOrderReceipt;
