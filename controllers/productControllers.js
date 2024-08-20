const mongoose = require('mongoose')

const Product = require('../models/productModel')

// Get all the products available
const getAllProducts = async(req, res) => {
    try {
        const products = await Product.find({}).populate('vendor', 'name')
        res.status(200).json(products)
    } 
    catch (err) {
        res.status(400).json({ message: 'Could not find products' })
    }
}

// Get all products of a specific logged-in vendor
const getVendorsProducts = async(req, res) => {
    try {
        const products = await Product.find({ vendor: req.user.id })
        if (!products) {
            return res.status(404).json({ message: 'Vendor has no products' });
        }
        res.status(200).json(products)
    }
    catch (err) {
        res.status(400).json({ message: 'Could not find products' })
    }
}

// Get a specific product
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

const deleteProduct = async(req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({error: 'No such product'}) 
        }

        const product = await Product.findOneAndDelete({_id: id})

        if (!product) {
            return res.status(404).json({error: 'No such product'})
        }
    
        res.status(200).json({ message: 'Product deleted' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}


module.exports = { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct, getVendorsProducts }
