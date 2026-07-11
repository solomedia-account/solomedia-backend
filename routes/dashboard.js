const express = require('express');
const router = express.Router();
const { Article, User, Activity, Notification, Category } = require('../models');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {
      articles: {
        total: 0,
        published: 0,
        draft: 0,
        views: 0
      },
      notifications: {
        unread: 0
      },
      activity: {
        recent: 0
      }
    };

    // Article stats based on role
    if (userRole === 'admin' || userRole === 'editor') {
      stats.articles.total = await Article.count();
      stats.articles.published = await Article.count({ where: { status: 'published' } });
      stats.articles.draft = await Article.count({ where: { status: 'draft' } });
      
      const viewsResult = await Article.sum('views');
      stats.articles.views = viewsResult || 0;
    } else if (userRole === 'author') {
      stats.articles.total = await Article.count({ where: { authorId: userId } });
      stats.articles.published = await Article.count({ where: { authorId: userId, status: 'published' } });
      stats.articles.draft = await Article.count({ where: { authorId: userId, status: 'draft' } });
      
      const viewsResult = await Article.sum('views', { where: { authorId: userId } });
      stats.articles.views = viewsResult || 0;
    }

    // Notification stats
    stats.notifications.unread = await Notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    // Recent activity
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    stats.activity.recent = await Activity.count({
      where: {
        userId,
        createdAt: { [Op.gte]: sevenDaysAgo }
      }
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recent articles for dashboard
router.get('/articles', auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let where = {};
    if (userRole !== 'admin' && userRole !== 'editor') {
      where.authorId = userId;
    }

    const articles = await Article.findAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }
      ],
      order: [['updatedAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(articles);
  } catch (error) {
    console.error('Dashboard articles error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get recent activity
router.get('/activity', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const activities = await Activity.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user list (admin/editor only)
router.get('/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'editor') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { limit = 20, page = 1, role } = req.query;
    const where = role ? { role } : {};

    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'role', 'isActive', 'isVerified', 'createdAt', 'stats'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    const total = await User.count({ where });

    res.json({
      users,
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

// Get system overview (admin only)
router.get('/overview', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const overview = {
      users: {
        total: await User.count(),
        active: await User.count({ where: { isActive: true } }),
        verified: await User.count({ where: { isVerified: true } }),
        byRole: await User.findAll({
          attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
          group: ['role'],
          order: [] // Remove default ORDER BY for MSSQL compatibility
        })
      },
      articles: {
        total: await Article.count(),
        published: await Article.count({ where: { status: 'published' } }),
        draft: await Article.count({ where: { status: 'draft' } }),
        totalViews: await Article.sum('views')
      },
      activity: {
        today: await Activity.count({
          where: {
            createdAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          }
        }),
        thisWeek: await Activity.count({
          where: {
            createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        })
      }
    };

    res.json(overview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
