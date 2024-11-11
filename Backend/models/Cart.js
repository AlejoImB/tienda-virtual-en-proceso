const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Puedes usar ObjectId si estás utilizando un modelo de usuario
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, default: 1 },
    }],
});

module.exports = mongoose.model('Cart', cartSchema);