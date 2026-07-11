const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Article = sequelize.define('Article', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  excerpt: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Categories',
      key: 'id',
    },
  },
  tags: {
    type: DataTypes.TEXT,
  },
  featuredImage: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived', 'pending_review', 'rejected'),
    defaultValue: 'draft',
  },
  rejectionReason: {
    type: DataTypes.TEXT,
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  publishedAt: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'Articles',
  timestamps: true,
  hooks: {
    beforeSave: (article) => {
      if (article.status === 'published' && !article.publishedAt) {
        article.publishedAt = new Date();
      }
    },
  },
});

module.exports = Article;
