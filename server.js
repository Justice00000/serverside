// server.js - Node.js backend for tracking system
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

// CORS Configuration
const corsOptions = {
  origin: [
    'https://justice00000.github.io/transcend',
    'https://git.transcendlogistics.online',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Optional: Static file serving (commented out for now)
// app.use(express.static(path.join(__dirname, 'public')));

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://admin_db_5jq5_user:zQ7Zey6xTtDtqT99fKgUepfsuEhCjIoZ@dpg-cvn925a4d50c73fv6m70-a.oregon-postgres.render.com/admin_db_5jq5',
  ssl: {
    rejectUnauthorized: false
  }
});

// Health Check Route
app.get('/', (req, res) => {
  res.json({
    message: 'Transcend Logistics Backend is running!',
    timestamp: new Date().toISOString(),
    databaseStatus: 'Connected'
  });
});

// Database Connection Test
pool.connect()
  .then(client => {
    console.log('Database connected successfully');
    client.release();

    // Test query to verify tracking_orders table
    return pool.query('SELECT COUNT(*) FROM tracking_orders');
  })
  .then(result => {
    console.log(`Found ${result.rows[0].count} tracking records in database`);
  })
  .catch(err => {
    console.error('Database connection or query error:', err);
  });

// Existing tracking API endpoint
app.post('/api/track', async (req, res) => {
  const { trackId } = req.body;
  
  console.log("Received tracking request for:", trackId);
  
  if (!trackId) {
    return res.status(400).json({ 
      found: false,
      message: 'Missing tracking ID' 
    });
  }

  try {
    const query = 'SELECT * FROM tracking_orders WHERE tracking_number = $1';
    const result = await pool.query(query, [trackId]);
    
    console.log("Query result:", result.rowCount > 0 ? "Record found" : "No record found");
    
    if (result.rows.length > 0) {
      const record = result.rows[0];
      
      const dispatchDate = record.dispatch_date ? new Date(record.dispatch_date).toLocaleDateString() : null;
      const deliveryDate = record.delivery_date ? new Date(record.delivery_date).toLocaleDateString() : null;
      
      res.json({
        found: true,
        tracking_number: record.tracking_number,
        status: record.status || 'Processing',
        origin: record.dispatch_location || null,
        destination: record.destination || null,
        estimated_delivery: deliveryDate || null,
        additional_info: {
          sender_name: record.sender_name,
          sender_address: record.sender_address,
          receiver_name: record.receiver_name,
          receiver_address: record.receiver_address,
          weight: record.weight,
          shipment_mode: record.shipment_mode,
          carrier: record.carrier,
          dispatch_date: dispatchDate,
          package_desc: record.package_desc,
          payment_mode: record.payment_mode,
          quantity: record.quantity,
          carrier_ref_no: record.carrier_ref_no
        }
      });
    } else {
      res.json({
        found: false,
        message: 'Tracking number not found.'
      });
    }
  } catch (error) {
    console.error('Database error details:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      found: false,
      message: 'Error retrieving tracking information',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
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