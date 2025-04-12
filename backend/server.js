// server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: 'https://eric-elite.vercel.app/',
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

// Basic Route
app.get('/', (req, res) => {
    res.send('Gamified LMS Backend is Running');
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

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
