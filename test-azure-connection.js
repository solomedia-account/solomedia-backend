require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('Testing Azure SQL connection...');
console.log('Server:', process.env.AZURE_SQL_SERVER);
console.log('Database:', process.env.AZURE_SQL_DATABASE);
console.log('User:', process.env.AZURE_SQL_USER);

const sequelize = new Sequelize(
  process.env.AZURE_SQL_DATABASE || 'solomedia',
  process.env.AZURE_SQL_USER || '',
  process.env.AZURE_SQL_PASSWORD || '',
  {
    host: process.env.AZURE_SQL_SERVER || 'solomedia1.database.windows.net',
    port: process.env.AZURE_SQL_PORT || 1433,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true,
        requestTimeout: 30000,
        connectionTimeout: 30000,
      },
    },
    pool: {
      max: 1,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: false,
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('✓ Connection successful!');
    console.log('Database connection established successfully.');
    return sequelize.close();
  })
  .then(() => {
    console.log('✓ Connection closed.');
    process.exit(0);
  })
  .catch(err => {
    console.error('✗ Connection failed!');
    console.error('Error:', err.message);
    console.error('Parent error:', err.parent?.message);
    process.exit(1);
  });
