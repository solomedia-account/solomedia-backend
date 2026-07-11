const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  displayName: {
    type: DataTypes.STRING,
  },
  headline: {
    type: DataTypes.STRING,
  },
  about: {
    type: DataTypes.TEXT,
  },
  expertise: {
    type: DataTypes.JSON,
  },
  interests: {
    type: DataTypes.JSON,
  },
  portfolio: {
    type: DataTypes.JSON,
  },
  achievements: {
    type: DataTypes.JSON,
  },
  contact: {
    type: DataTypes.JSON,
  },
  socialMedia: {
    type: DataTypes.JSON,
  },
  settings: {
    type: DataTypes.JSON,
  },
}, {
  timestamps: true,
});

module.exports = Profile;
