const { Sequelize } = require('sequelize');

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
        requestTimeout: 60000,
        connectTimeout: 60000,
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: false,
  }
);

module.exports = sequelize;
