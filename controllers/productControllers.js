const Product = require('../models/productModel')

const getAllProducts = async(req, res) => {
    try {
        const products = await Product.find({})
        res.status(200).json(products)
    } 
    catch (err) {
        res.status(400).json({ message: 'Could not find products' })
    }
}

const createProduct = async(req, res) => {
    try {
        const product = await Product.create({ ...req.body, vendor: req.user.id })
        res.status(201).json(product)
    }
    catch (err) {
        res.status(400).json({ message: 'Error creating product' })
    }
}

module.exports = { createProduct, getAllProducts }