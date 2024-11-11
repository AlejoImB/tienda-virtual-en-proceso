const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Importar rutas
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes'); // Rutas del carrito

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conectar a la base de datos
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Base de datos conectada'))
    .catch(err => console.error('Error al conectar a la base de datos', err));

// Rutas
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes); // Rutas del carrito

// Ruta para la raíz (opcional)
app.get('/', (req, res) => {
    res.send('¡Bienvenido a la API de moda!');
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});