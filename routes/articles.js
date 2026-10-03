const express = require('express');
const router = express.Router();
const { Article, User, Category } = require('../models');
const { Op } = require('sequelize');
const { auth, authorize } = require('../middleware/auth');
const { notifyIndexNow } = require('../utils/indexNow');

const BASE_URL = process.env.FRONTEND_URL || 'https://solomedia.onrender.com';

const serializeTags = (tags) => Array.isArray(tags) ? JSON.stringify(tags) : tags;
const normalizeStatus = (status, userRole) => {
  if (userRole === 'author' && status === 'published') return 'pending_review';
  return status || 'draft';
};

// Get all published articles
router.get('/', async (req, res) => {
  try {
    const { category, featured, limit = 20, page = 1, search } = req.query;
    const where = { status: 'published' };
    
    if (category) where.categoryId = category;
    if (featured === 'true') where.isFeatured = true;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { excerpt: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }

    const articles = await Article.findAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'color'] }
      ],
      order: [['publishedAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    const total = await Article.count({ where });

    res.json({
      articles,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending review articles (admin/editor only) - MUST be before /:slug
router.get('/review/pending', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const articles = await Article.findAll({
      where: { status: 'pending_review' },
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'email'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single article by ID (for editing)
router.get('/id/:id', auth, async (req, res) => {
  try {
    console.log('Fetching article by ID:', req.params.id, 'User:', req.user.id, 'Role:', req.user.role);
    const article = await Article.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar', 'bio'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'description'] }
      ]
    });

    if (!article) {
      console.log('Article not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Article not found' });
    }

    console.log('Article found:', article.id, 'Author:', article.authorId);

    // Check if user is author or admin/editor
    if (article.authorId !== req.user.id && 
        !['admin', 'editor'].includes(req.user.role)) {
      console.log('User not authorized:', req.user.id, 'Article author:', article.authorId, 'Role:', req.user.role);
      return res.status(403).json({ message: 'Not authorized to view this article' });
    }

    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single article by slug
router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({
      where: { slug: req.params.slug, status: 'published' },
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar', 'bio'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'description'] }
      ]
    });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Increment views
    await article.increment('views');

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create article (protected)
router.post('/', auth, authorize('admin', 'editor', 'author'), async (req, res) => {
  try {
    const status = normalizeStatus(req.body.status, req.user.role);
    
    // Validate required fields
    const requiredFields = ['title', 'slug', 'excerpt', 'content', 'categoryId'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    const articleData = {
      title: req.body.title,
      slug: req.body.slug,
      excerpt: req.body.excerpt,
      content: req.body.content,
      authorId: req.user.id,
      categoryId: req.body.categoryId,
      status,
      tags: serializeTags(req.body.tags),
      featuredImage: req.body.featuredImage || null,
      isFeatured: req.body.isFeatured || false,
      ...(status === 'published' && { publishedAt: new Date() })
    };
    
    console.log('Creating article with data:', { 
      ...articleData, 
      content: articleData.content?.substring(0, 100) + '...',
      featuredImage: articleData.featuredImage 
    });
    
    const article = await Article.create(articleData);
    
    // Notify IndexNow if article is published
    if (status === 'published') {
      const articleUrl = `${BASE_URL}/article/${article.slug}`;
      notifyIndexNow(articleUrl).catch(err => console.error('IndexNow notification failed:', err));
    }
    
    res.status(201).json(article);
  } catch (error) {
    console.error('Error creating article:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      errors: error.errors
    });
    
    // Handle specific validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: `Validation error: ${error.errors.map(e => e.message).join(', ')}` 
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: `Duplicate entry: ${error.errors[0].message}` 
      });
    }
    
    res.status(400).json({ message: error.message });
  }
});

// Update article (protected)
router.put('/:id', auth, authorize('admin', 'editor', 'author'), async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (article.authorId !== req.user.id && !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to update this article' });
    }

    const status = normalizeStatus(req.body.status, req.user.role);
    const updateData = {
      title: req.body.title,
      slug: req.body.slug,
      excerpt: req.body.excerpt,
      content: req.body.content,
      categoryId: req.body.categoryId,
      status,
      tags: serializeTags(req.body.tags),
      featuredImage: req.body.featuredImage || null,
      isFeatured: req.body.isFeatured || false,
    };

    console.log('Updating article with data:', { 
      ...updateData, 
      content: updateData.content?.substring(0, 100) + '...',
      featuredImage: updateData.featuredImage 
    });

    await article.update(updateData);
    
    // Notify IndexNow if article is published
    if (status === 'published') {
      const articleUrl = `${BASE_URL}/article/${article.slug}`;
      notifyIndexNow(articleUrl).catch(err => console.error('IndexNow notification failed:', err));
    }
    
    res.json(article);
  } catch (error) {
    console.error('Error updating article:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      errors: error.errors
    });
    
    // Handle specific validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: `Validation error: ${error.errors.map(e => e.message).join(', ')}` 
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: `Duplicate entry: ${error.errors[0].message}` 
      });
    }
    
    res.status(400).json({ message: error.message });
  }
});

// Delete article (protected)
router.delete('/:id', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Extract Cloudinary public IDs from article
    const publicIds = [];

    // Extract from featured image
    if (article.featuredImage) {
      const match = article.featuredImage.match(/\/v\d+\/([^/]+)\./);
      if (match) {
        publicIds.push(match[1]);
      }
    }

    // Extract from content (images and videos)
    if (article.content) {
      // Match Cloudinary URLs in content
      const urlRegex = /https?:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|video)\/upload\/v\d+\/([^/]+)/g;
      let match;
      while ((match = urlRegex.exec(article.content)) !== null) {
        if (!publicIds.includes(match[1])) {
          publicIds.push(match[1]);
        }
      }
    }

    // Delete from Cloudinary
    const cloudinary = require('../config/r2');
    await Promise.allSettled(
      publicIds.map(publicId => cloudinary.uploader.destroy(publicId, { resource_type: 'auto' }))
    );

    // Delete article from database
    await article.destroy();

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve or reject article (admin/editor only)
router.put('/:id/review', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['published', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be published or rejected' });
    }

    const article = await Article.findByPk(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const updateData = { status };
    if (status === 'published') {
      updateData.publishedAt = new Date();
    }
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    await article.update(updateData);
    
    // Notify IndexNow if article is published
    if (status === 'published') {
      const articleUrl = `${BASE_URL}/article/${article.slug}`;
      notifyIndexNow(articleUrl).catch(err => console.error('IndexNow notification failed:', err));
    }
    
    res.json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
