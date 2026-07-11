const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('article_created', 'article_updated', 'article_deleted', 'article_viewed', 'comment_added', 'user_followed', 'profile_updated', 'login'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  metadata: {
    type: DataTypes.JSON,
  },
  ipAddress: {
    type: DataTypes.STRING,
  },
  userAgent: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'createdAt'],
    },
    {
      fields: ['type', 'createdAt'],
    },
  ],
});

module.exports = Activity;
