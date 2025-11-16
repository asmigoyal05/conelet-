const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
  
    userId: {
        type: String, 
        required: true
    }
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;

