const mysql = require('mysql2/promise');

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
  });

  try {
    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'solomedia'}\``);
    console.log(`Database ${process.env.DB_NAME || 'solomedia'} created or already exists`);

    // Use the database
    await connection.query(`USE \`${process.env.DB_NAME || 'solomedia'}\``);
    console.log(`Using database ${process.env.DB_NAME || 'solomedia'}`);

    console.log('Database setup complete. The tables will be created automatically when you start the server.');
    console.log('Make sure your .env file has the correct database configuration:');
    console.log('DB_HOST=localhost');
    console.log('DB_USER=root');
    console.log('DB_PASSWORD=password');
    console.log('DB_NAME=solomedia');

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await connection.end();
  }
}

setupDatabase();
