require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();

// CORS Configuration
const corsOptions = {
    origin: [
        'https://justice00000.github.io/transcend',
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Database Connection Test
pool.connect()
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Database connection error', err));

// Health Check Route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Transcend Logistics Backend is running!',
        timestamp: new Date().toISOString(),
        databaseStatus: 'Connected'
    });
});

// Tracking Records Route (Example)
app.get('/api/tracking', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tracking_records');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching tracking records', err);
        res.status(500).json({ error: 'Failed to fetch tracking records' });
    }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message 
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    pool.end()
        .then(() => {
            console.log('Database pool has ended');
            process.exit(0);
        })
        .catch(err => {
            console.error('Error ending database pool', err);
            process.exit(1);
        });
});