const Product = require('../models/productModel')

const getAllProducts = async(req, res) => {
    try {
        const products = await Product.find({}).populate('vendor', 'name')
        res.status(200).json(products)
    } 
    catch (err) {
        res.status(400).json({ message: 'Could not find products' })
    }
}

const getSingleProduct = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('vendor', 'name');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: 'Error fetching product' });
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


const updateProduct = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Check if the logged-in user is the owner of the product or an admin
        if (product.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to update this product' });
        }
    
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
    
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: 'Error updating product' });
    }
}

//TODO delete product

module.exports = { createProduct, getAllProducts, getSingleProduct, updateProduct }
