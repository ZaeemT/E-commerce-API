const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    description: { 
        type: String 
    },
    price: { 
        type: Number, 
        required: true 
    },
    vendor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Ecomm_User', 
        required: true
    }
})

module.exports = mongoose.model('Product', productSchema)
