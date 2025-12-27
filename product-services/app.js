// const express = require('express');
// const app = express();

// //Dummy data produk
// const products = [
//     { id: 1, name: 'iPhone 17 Pro Max', price: 100, Description: 'This is iPhone 17 Pro Max' },
//     { id: 2, name: 'Microwave', price: 150, Description: 'This is Microwave' },
//     { id: 3, name: 'Laptop MacBook', price: 200, Description: 'This is Laptop MacBook' },
//     { id: 4, name: 'Smart TV Samsung 55 Inch', price: 250, Description: 'This is Smart TV Samsung 55 Inch' },
//     { id: 5, name: 'PlayStation 5', price: 300, Description: 'This is PlayStation 5' },
//     { id: 6, name: 'AirPods Pro 3', price: 120, Description: 'This is AirPods Pro 3' },
//     { id: 7, name: 'Smartwatch Apple Watch 10', price: 180, Description: 'This is Smartwatch Apple Watch 10' },
//     { id: 8, name: 'Bluetooth Speaker JBL Charge 6', price: 90, Description: 'This is Bluetooth Speaker JBL Charge 6' },
//     { id: 9, name: 'Camera Canon EOS R6', price: 400, Description: 'This is Camera Canon EOS R6' },
//     { id: 10, name: 'Gaming Laptop ASUS ROG', price: 350, Description: 'This is Gaming Laptop ASUS ROG' },
// ];

// // Endpoint untuk mendapatkan daftar produk
// app.get('/products', (req, res) => {
//     res.json(products);
// });

// // Endpoint untuk mendapatkan detail produk berdasarkan ID
// app.get('/products/:id', (req, res) => {
//     const productId = parseInt(req.params.id);
//     const product = products.find(p => p.id === productId);
//     if (product) {
//         res.json(product);
//     } else {
//         res.status(404).json({ message: 'Product not found' });
//     }
// });

// // Menjalankan server pada port 3000
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Product services running on port ${PORT}`);
// });

// // Cara Kedua
// // app.listen(3000, () => console.log('Product services running on port 3000'));




// const express = require('express');
// const cors = require('cors');
// const {DataTypes} = require('sequelize');
// const { sequelize, connectWithRetry } = require('./database');

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Definisikan model Produk
// const Product = sequelize.define('Product', {
//     name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     price: {
//         type: DataTypes.FLOAT,
//         allowNull: false,
//     },
//     description: {
//         type: DataTypes.TEXT,
//     },
// });

// // Sinkronisasi model dengan database
// (async () => {
//     await connectWithRetry();
//     await sequelize.sync({alter: true});
//     console.log('Database & tables created!');
// })();

// // Helper Response
// const success = (res, message, data = null) => 
//     res.status(200).json({ message, data });

// const error = (res, status, message ) => 
//     res.status(status).json({ success: false, message });

// //Routes

// app.get('/products', async (req, res) => {
//     try {
//         const data = await Product.findAll();
//         success(res, 'Products retrieved successfully', data);
//     } catch (err) {
//         error(res, 500, 'Failed to retrieve products');
//     }
// });

// app.get('/products/:id', async (req, res) => {
//     const product = await Product.findByPk(req.params.id);
//     if (!product) return error(res, 404, 'Product not found');
//     success(res, 'Product retrieved successfully', product);
// });

// //tambah produk baru
// app.post('/products', async (req, res) => {
//     const { name, price, description } = req.body;

//     if(!name || !price) return error(res, 400, 'Name and Price are required');

//     const product = await Product.create({ name, price, description });
//     success(res, 'Product created successfully', product);
// });

// //update produk
// app.put('/products/:id', async (req, res) => {
//     const product = await Product.findByPk(req.params.id);
//     if (!product) return error(res, 404, 'Product not found');

//     await product.update(req.body);
//     success(res, 'Product updated successfully', product);
// });

// //delete produk
// app.delete('/products/:id', async (req, res) => {
//     const product = await Product.findByPk(req.params.id);
//     if (!product) return error(res, 404, 'Product not found');
    
//     await product.destroy();
//     success(res, 'Product deleted successfully');
// });

// // Menjalankan server pada port 3000
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Product service is running on port ${PORT}`);
// });


const express = require('express');
const cors = require('cors');
const { DataTypes } = require('sequelize');
const { sequelize, connectWithRetry } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Model Produk (TANPA IMAGE)
const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    }
    // Field image_url sudah dihapus
});

// Sinkronisasi Database
(async () => {
    await connectWithRetry();
    await sequelize.sync({ alter: true });
    console.log('Database & tables synced!');
})();

// Helper Response
const success = (res, message, data = null) => 
    res.status(200).json({ success: true, message, data });

const error = (res, status, message) => 
    res.status(status).json({ success: false, message });

// --- ROUTES ---

// GET All
app.get('/products', async (req, res) => {
    try {
        const data = await Product.findAll();
        success(res, 'Products retrieved successfully', data);
    } catch (err) {
        error(res, 500, err.message);
    }
});

// GET By ID
app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return error(res, 404, 'Product not found');
        success(res, 'Product retrieved successfully', product);
    } catch (err) {
        error(res, 500, err.message);
    }
});

// POST (Create - TANPA IMAGE)
app.post('/products', async (req, res) => {
    const { name, price, description } = req.body; // image_url dihapus

    if (!name || !price) return error(res, 400, 'Name and Price are required');

    try {
        const product = await Product.create({ name, price, description });
        success(res, 'Product created successfully', product);
    } catch (err) {
        error(res, 500, err.message);
    }
});

// PUT (Update - TANPA IMAGE)
app.put('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return error(res, 404, 'Product not found');

        await product.update(req.body); // Otomatis hanya update field yang dikirim
        success(res, 'Product updated successfully', product);
    } catch (err) {
        error(res, 500, err.message);
    }
});

// DELETE
app.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return error(res, 404, 'Product not found');

        await product.destroy();
        success(res, 'Product deleted successfully');
    } catch (err) {
        error(res, 500, err.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Product service is running on port ${PORT}`);
});