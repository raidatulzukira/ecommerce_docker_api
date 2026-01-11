const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- 1. KONFIGURASI DATABASE POSTGRESQL ---
// Mengambil config dari Environment Variable (diset di docker-compose)
const sequelize = new Sequelize(
    process.env.DB_NAME || 'user_db',
    process.env.DB_USER || 'user',
    process.env.DB_PASSWORD || 'password',
    {
        host: process.env.DB_HOST || 'postgres-db',
        dialect: 'postgres',
        logging: false, // Matikan log SQL di console agar bersih
    }
);


// --- 2. MODEL USER ---
const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'customer'),
        defaultValue: 'customer'
    }
});

// --- 3. SINKRONISASI DATABASE ---
// Coba konek dan buat tabel otomatis
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to PostgreSQL has been established successfully.');
        await sequelize.sync(); // Creates table if not exists
        console.log('Database synced!');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

// Dummy data pengguna
// const users = [
//   { id: 1, name: "Alice", email: "alice@example.com", role: "customer" },
//   { id: 2, name: "Bob", email: "bob@example.com", role: "seller" },
//   { id: 3, name: "Charlie", email: "charlie@example.com", role: "admin" }
// ];


// --- 4. ROUTES ---

app.get('/', (req, res) => {
    res.json({ message: "User Service (PostgreSQL) is running on port 4000" });
});

// A. REGISTER (Untuk Admin & Customer)
app.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validasi Role (Hanya boleh admin/customer)
        let userRole = 'customer';
        if (role === 'admin') userRole = 'admin';

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: userRole
        });

        res.status(201).json({
            message: "User registered successfully",
            data: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- SISIPKAN INI (Agar Admin bisa Add User via 'POST /users') ---

app.post('/users', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Cek apakah email sudah ada
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // 2. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Buat User Baru
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'customer' // Default jadi customer jika role kosong
        });

        res.status(201).json({
            message: "User added successfully",
            data: { 
                id: newUser.id, 
                name: newUser.name, 
                email: newUser.email, 
                role: newUser.role 
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// B. LOGIN (Penting untuk Flutter)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cari User
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Cek Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Return Data (Flutter akan baca 'role' dari sini)
        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// C. GET ALL USERS (Khusus Admin - Melihat daftar user)
app.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] } // Jangan tampilkan password
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// 1. GET List Users
// app.get('/users', (req, res) => {
//     res.json(users);
// });


// D. GET USER BY ID
app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });
        if (user) res.json(user);
        else res.status(404).json({ message: 'User not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// 2. GET Detail User by ID
// app.get('/users/:id', (req, res) => {
//     const userId = parseInt(req.params.id);
//     const user = users.find(u => u.id === userId);
    
//     if (user) {
//         res.json(user);
//     } else {
//         res.status(404).json({ message: 'User not found' });
//     }
// });


// E. DELETE USER (Khusus Admin)
app.delete('/users/:id', async (req, res) => {
    try {
        const result = await User.destroy({ where: { id: req.params.id } });
        if (result) res.json({ message: "User deleted" });
        else res.status(404).json({ message: "User not found" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// F. UPDATE USER (SISIPKAN INI)
app.put('/users/:id', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        user.name = name;
        user.email = email;
        user.role = role;

        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        await user.save();
        res.json({ message: "User updated", user });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// 3. POST Tambah User Baru (Support JSON & Form Data)
// app.post('/users', (req, res) => {
//     // req.body otomatis berisi data baik dari JSON maupun Form Data
//     const { name, email, role } = req.body;

//     // Validasi sederhana
//     if (!name || !email || !role) {
//         return res.status(400).json({ message: "Name, email, and role are required" });
//     }

//     const newUser = {
//         id: users.length + 1, 
//         name,
//         email,
//         role
//     };

//     users.push(newUser);
//     res.status(201).json(newUser);
// });


const PORT = 4000;
app.listen(PORT, () => {
    console.log(`User services running on port ${PORT}`);
});