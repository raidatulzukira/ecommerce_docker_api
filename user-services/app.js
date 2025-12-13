const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

// 1. Parsing untuk JSON (tetap ada)
app.use(express.json()); 

// 2. Parsing untuk x-www-form-urlencoded (Form Data)
app.use(express.urlencoded({ extended: true })); 

// Dummy data pengguna
const users = [
  { id: 1, name: "Alice", email: "alice@example.com", role: "customer" },
  { id: 2, name: "Bob", email: "bob@example.com", role: "seller" },
  { id: 3, name: "Charlie", email: "charlie@example.com", role: "admin" }
];

app.get('/', (req, res) => {
    res.json({ message: "User Service is running on port 4000" });
});

// 1. GET List Users
app.get('/users', (req, res) => {
    res.json(users);
});

// 2. GET Detail User by ID
app.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// 3. POST Tambah User Baru (Support JSON & Form Data)
app.post('/users', (req, res) => {
    // req.body otomatis berisi data baik dari JSON maupun Form Data
    const { name, email, role } = req.body;

    // Validasi sederhana
    if (!name || !email || !role) {
        return res.status(400).json({ message: "Name, email, and role are required" });
    }

    const newUser = {
        id: users.length + 1, 
        name,
        email,
        role
    };

    users.push(newUser);
    res.status(201).json(newUser);
});

// PORT KE 4000
const PORT = 4000; 
app.listen(PORT, () => {
    console.log(`User services running on port ${PORT}`);
});