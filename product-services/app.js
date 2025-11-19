const express = require('express');
const app = express();

//Dummy data produk
const products = [
    { id: 1, name: 'iPhone 17 Pro Max', price: 100, Description: 'This is iPhone 17 Pro Max' },
    { id: 2, name: 'Microwave', price: 150, Description: 'This is Microwave' },
    { id: 3, name: 'Laptop MacBook', price: 200, Description: 'This is Laptop MacBook' },
    { id: 4, name: 'Smart TV Samsung 55 Inch', price: 250, Description: 'This is Smart TV Samsung 55 Inch' },
    { id: 5, name: 'PlayStation 5', price: 300, Description: 'This is PlayStation 5' },
    { id: 6, name: 'AirPods Pro 3', price: 120, Description: 'This is AirPods Pro 3' },
    { id: 7, name: 'Smartwatch Apple Watch 10', price: 180, Description: 'This is Smartwatch Apple Watch 10' },
    { id: 8, name: 'Bluetooth Speaker JBL Charge 6', price: 90, Description: 'This is Bluetooth Speaker JBL Charge 6' },
    { id: 9, name: 'Camera Canon EOS R6', price: 400, Description: 'This is Camera Canon EOS R6' },
    { id: 10, name: 'Gaming Laptop ASUS ROG', price: 350, Description: 'This is Gaming Laptop ASUS ROG' },
];

// Endpoint untuk mendapatkan daftar produk
app.get('/products', (req, res) => {
    res.json(products);
});

// Endpoint untuk mendapatkan detail produk berdasarkan ID
app.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// Menjalankan server pada port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Product services running on port ${PORT}`);
});

// Cara Kedua
// app.listen(3000, () => console.log('Product services running on port 3000'));