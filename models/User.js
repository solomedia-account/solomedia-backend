const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'editor', 'author', 'subscriber'),
    defaultValue: 'subscriber',
  },
  bio: {
    type: DataTypes.TEXT,
  },
  avatar: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
  },
  website: {
    type: DataTypes.STRING,
  },
  socialLinks: {
    type: DataTypes.JSON,
  },
  preferences: {
    type: DataTypes.JSON,
  },
  stats: {
    type: DataTypes.JSON,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  lastLogin: {
    type: DataTypes.DATE,
  },
}, {
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.canEditArticle = function(article) {
  if (this.role === 'admin' || this.role === 'editor') return true;
  if (this.role === 'author' && article.authorId === this.id) return true;
  return false;
};

User.prototype.canDeleteArticle = function() {
  return this.role === 'admin' || this.role === 'editor';
};

User.prototype.canManageUsers = function() {
  return this.role === 'admin';
};

User.prototype.canManageCategories = function() {
  return this.role === 'admin' || this.role === 'editor';
};

module.exports = User;
