const { Pool } = require('pg');

// Use the connection string directly
const connectionString = 'postgresql://admin_db_5jq5_user:zQ7Zey6xTtDtqT99fKgUepfsuEhCjIoZ@dpg-cvn925a4d50c73fv6m70-a/admin_db_5jq5';

const pool = new Pool({
  connectionString: connectionString,
});

async function testQuery() {
  try {
    console.log("Testing connection...");
    const result = await pool.query('SELECT NOW()');
    console.log("Connection successful:", result.rows[0]);
    
    console.log("Testing tracking query...");
    const trackingResult = await pool.query('SELECT * FROM tracking_orders LIMIT 1');
    console.log("Found records:", trackingResult.rowCount);
    
    if (trackingResult.rowCount > 0) {
      console.log("Sample record:", trackingResult.rows[0]);
    }
  } catch (error) {
    console.error("Error in test-connection.js");
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://admin_db_5jq5_user:zQ7Zey6xTtDtqT99fKgUepfsuEhCjIoZ@dpg-cvn925a4d50c73fv6m70-a.oregon-postgres.render.com/admin_db_5jq5',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('Connection successful!');
    console.log('Current time on database server:', result.rows[0].now);
    
    // Try to query tracking_orders table
    console.log('\nChecking tracking_orders table...');
    const trackingResult = await pool.query('SELECT COUNT(*) FROM tracking_orders');
    console.log(`Found ${trackingResult.rows[0].count} tracking records`);
    
    if (parseInt(trackingResult.rows[0].count) > 0) {
      const sampleRecord = await pool.query('SELECT * FROM tracking_orders LIMIT 1');
      console.log('\nSample tracking record:');
      console.log(sampleRecord.rows[0]);
    }
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await pool.end();
  }
}

testConnection();
  } finally {
    pool.end();
  }
}

testQuery();