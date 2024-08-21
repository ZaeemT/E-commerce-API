const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateOrderReceipt = (order, filePath) => {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text('Order Receipt', { align: 'center' });

    doc.moveDown();
    doc.fontSize(14).text(`Order ID: ${order._id}`);
    doc.text(`Order Date: ${order.createdAt}`);
    doc.text(`Customer: ${order.customer.name} (${order.customer.email})`);

    doc.moveDown();
    doc.fontSize(16).text('Order Items:');

    order.orderItems.forEach((item, index) => {
        doc.fontSize(12).text(`${index + 1}. ${item.product.name} - $${item.product.price} x ${item.quantity}`);
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total Price: $${order.totalPrice}`, { align: 'right' });

    doc.end();
};

module.exports = generateOrderReceipt;
