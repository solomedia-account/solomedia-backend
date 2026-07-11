const express = require('express');
const router = express.Router();
const { Article, User, Category } = require('../models');
const { auth, authorize } = require('../middleware/auth');

// Get all published articles
router.get('/', async (req, res) => {
  try {
    const { category, featured, limit = 20, page = 1 } = req.query;
    const where = { status: 'published' };
    
    if (category) where.categoryId = category;
    if (featured === 'true') where.isFeatured = true;

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
    const article = await Article.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar', 'bio'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'description'] }
      ]
    });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if user is author or admin/editor
    if (article.authorId !== req.user.id && 
        !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to view this article' });
    }

    res.json(article);
  } catch (error) {
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
    console.log('Creating article with data:', { ...req.body, content: req.body.content?.substring(0, 50) + '...' });
    console.log('User:', req.user.id, req.user.role);
    
    // Authors submit as 'pending_review', admins/editors can publish directly
    let status = req.body.status || 'draft';
    if (req.user.role === 'author' && status === 'published') {
      status = 'pending_review';
    }
    
    const articleData = {
      ...req.body,
      authorId: req.user.id,
      status
    };
    
    // Convert tags array to JSON string for MSSQL TEXT field
    if (articleData.tags && Array.isArray(articleData.tags)) {
      articleData.tags = JSON.stringify(articleData.tags);
    }
    
    // Set publishedAt when status is published
    if (status === 'published') {
      articleData.publishedAt = new Date();
    }
    
    const article = await Article.create(articleData);
    console.log('Article created successfully:', article.id, article.status, 'publishedAt:', article.publishedAt);
    res.status(201).json(article);
  } catch (error) {
    console.error('Article creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update article (protected)
router.put('/:id', auth, authorize('admin', 'editor', 'author'), async (req, res) => {
  try {
    console.log('Updating article:', req.params.id, 'with data:', { ...req.body, content: req.body.content?.substring(0, 50) + '...' });
    console.log('User:', req.user.id, req.user.role);
    
    const article = await Article.findByPk(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if user is author or admin/editor
    if (article.authorId !== req.user.id && 
        !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to update this article' });
    }

    // Authors cannot publish directly - convert to pending_review
    let updateData = { ...req.body };
    if (req.user.role === 'author' && updateData.status === 'published') {
      updateData.status = 'pending_review';
    }

    // Convert tags array to JSON string for MSSQL TEXT field
    if (updateData.tags && Array.isArray(updateData.tags)) {
      updateData.tags = JSON.stringify(updateData.tags);
    }

    await article.update(updateData);
    console.log('Article updated successfully:', article.id, article.status);
    res.json(article);
  } catch (error) {
    console.error('Article update error:', error);
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
    for (const publicId of publicIds) {
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
        console.log('Deleted from Cloudinary:', publicId);
      } catch (error) {
        console.error('Failed to delete from Cloudinary:', publicId, error);
      }
    }

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
    res.json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
