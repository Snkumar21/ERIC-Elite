// server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path'); // Add this at the top
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: 'https://eric-elite.vercel.app',
    credentials: true
}));

app.use(bodyParser.json());
app.use(express.static('public'));

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Snkumar30',
    database: process.env.DB_NAME || 'gamified_lms'
});

db.connect((err) => {
    if (err) {
        console.error('MySQL Connection Error: ', err);
    } else {
        console.log('Connected to MySQL Database');
    }
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// User Registration Endpoint
app.post('/registerform', (req, res) => {
    const { username, email, password } = req.body;

    const userExistsQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(userExistsQuery, [email], (err, result) => {
        if (err) {
            console.error("Error checking user existence:", err);
            return res.status(500).json({ success: false, message: 'Error checking user' });
        }

        if (result.length > 0) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash the password before saving it
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error("Error hashing password:", err);
                return res.status(500).json({ success: false, message: 'Error hashing password' });
            }

            const query = 'INSERT INTO users (username, email, password1) VALUES (?, ?, ?)';
            db.query(query, [username, email, hash], (err, result) => {
                if (err) {
                    console.error("Error registering user:", err);
                    return res.status(500).json({ success: false, message: 'Error registering user' });
                }

                res.status(201).json({ success: true, message: 'User registered successfully' });
            });
        });
    });
});

// User Login Endpoint
app.post('/loginform', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, result) => {
        if (err) return res.status(500).send({ success: false, message: 'Error logging in' });
        if (result.length === 0) return res.status(400).send({ success: false, message: 'User not found' });

        const user = result[0];

        bcrypt.compare(password, user.password1, (err, isMatch) => {
            if (err) return res.status(500).send({ success: false, message: 'Error checking password' });
            if (!isMatch) return res.status(400).send({ success: false, message: 'Invalid password' });

            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
            res.status(200).send({ success: true, message: 'Login successful', token });
        });
    });
});

app.get('/profile', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    db.query('SELECT id, username, email, points FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json(result[0]);
    });
});

// Sample route to test DB connection
app.get('/api/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(results);
        }
    });
});

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Send index.html on root access
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
