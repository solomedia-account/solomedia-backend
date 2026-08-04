const express = require('express');
const router = express.Router();
const { Article, User, Category } = require('../models');
const { Op } = require('sequelize');
const { auth, authorize } = require('../middleware/auth');

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
    const articleData = {
      ...req.body,
      authorId: req.user.id,
      status,
      tags: serializeTags(req.body.tags),
      ...(status === 'published' && { publishedAt: new Date() })
    };
    
    const article = await Article.create(articleData);
    res.status(201).json(article);
  } catch (error) {
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

    const updateData = {
      ...req.body,
      status: normalizeStatus(req.body.status, req.user.role),
      tags: serializeTags(req.body.tags)
    };

    await article.update(updateData);
    res.json(article);
  } catch (error) {
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
    res.json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
