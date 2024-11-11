const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
    }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
    const { name, price, imageUrl, category, discount } = req.body;

    // Validar la entrada
    if (!name || !price || !imageUrl || !category) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const newProduct = new Product({
        name,
        price,
        imageUrl,
        category,
        discount: discount || 0, // Establecer descuento a 0 si no se proporciona
    });

    try {
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el producto', error: error.message });
    }
});

// Actualizar un producto por ID
router.put('/:id', async (req, res) => {
    const { name, price, imageUrl, category, discount } = req.body;

    // Validar la entrada
    if (!name || !price || !imageUrl || !category) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
            name,
            price,
            imageUrl,
            category,
            discount: discount || 0, // Establecer descuento a 0 si no se proporciona
        }, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el producto', error: error.message });
    }
});

// Eliminar un producto por ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        console.error(error); // Imprime el error en la consola para diagnóstico
        res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
    }
});

module.exports = router;