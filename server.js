// server.js - Node.js backend for tracking system
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Database connection pool with the connection that worked in your test
const pool = new Pool({
  connectionString: 'postgresql://admin_db_5jq5_user:zQ7Zey6xTtDtqT99fKgUepfsuEhCjIoZ@dpg-cvn925a4d50c73fv6m70-a.oregon-postgres.render.com/admin_db_5jq5',
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
    
    // Test query to verify tracking_orders table exists
    pool.query('SELECT COUNT(*) FROM tracking_orders', (err, res) => {
      if (err) {
        console.error('Error accessing tracking_orders table:', err);
      } else {
        console.log(`Found ${res.rows[0].count} tracking records in database`);
      }
    });
  }
});

// API endpoint for tracking
app.post('/api/track', async (req, res) => {
  const { trackId } = req.body;
  
  console.log("Received tracking request for:", trackId);
  
  // Validate tracking ID
  if (!trackId) {
    return res.status(400).json({ 
      found: false,
      message: 'Missing tracking ID' 
    });
  }

  try {
    // Query the database for the tracking record
    const query = 'SELECT * FROM tracking_orders WHERE tracking_number = $1';
    const result = await pool.query(query, [trackId]);
    
    console.log("Query result:", result.rowCount > 0 ? "Record found" : "No record found");
    
    // Check if a record was found
    if (result.rows.length > 0) {
      const record = result.rows[0];
      
      // Format dates if they exist
      const dispatchDate = record.dispatch_date ? new Date(record.dispatch_date).toLocaleDateString() : null;
      const deliveryDate = record.delivery_date ? new Date(record.delivery_date).toLocaleDateString() : null;
      
      // Return tracking information mapped to your actual columns
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
      // Return not found response
      res.json({
        found: false,
        message: 'Tracking number not found.'
      });
    }
  } catch (error) {
    console.error('Database error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Return error response with more details
    res.status(500).json({
      found: false,
      message: 'Error retrieving tracking information',
      error: error.message
    });
  }
});

// Serve the main HTML page for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});