const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
   
    name: {
        type: String,
        required: true,
        trim: true 
    },
    description: { 
        type: String,
        required: false 
    },
    price: {
        type: Number,
        required: true,
        min: 0 
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['parfait', 'cone', 'tub'], 
        required: true,
        lowercase: true 
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {

    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

