const express = require('express');
const { getCart, addToCart, removeFromCart, clearCart } = require('../controllers/cartController');
const router = express.Router();

// Obtener el carrito del usuario
router.get('/:userId', getCart);

// Agregar un producto al carrito
router.post('/:userId/add', addToCart);

// Eliminar un producto del carrito
router.delete('/:userId/remove/:productId', removeFromCart);

// Limpiar el carrito
router.delete('/:userId/clear', clearCart);

module.exports = router;