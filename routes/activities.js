const express = require('express');
const router = express.Router();
const { Activity } = require('../models');
const { auth } = require('../middleware/auth');

// Log user activity
router.post('/', auth, async (req, res) => {
  try {
    const { type, description, metadata } = req.body;
    
    const activity = await Activity.create({
      userId: req.user.id,
      type,
      description,
      metadata,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user activities
router.get('/', auth, async (req, res) => {
  try {
    const { type, limit = 20, page = 1 } = req.query;
    
    const where = { userId: req.user.id };
    if (type) {
      where.type = type;
    }

    const activities = await Activity.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    const total = await Activity.count({ where });

    res.json({
      activities,
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

// Get activities by type
router.get('/type/:type', auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const activities = await Activity.findAll({
      where: {
        userId: req.user.id,
        type: req.params.type
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete activity (user can delete their own activities)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Activity.destroy({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json({ message: 'Activity deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
