const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { auth } = require('../middleware/auth');

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const { unreadOnly = false, limit = 20, page = 1 } = req.query;
    
    const where = { userId: req.user.id };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    const total = await Notification.count({ where });
    const unreadCount = await Notification.count({ 
      where: { 
        userId: req.user.id, 
        isRead: false 
      }
    });

    res.json({
      notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      },
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const [updated] = await Notification.update(
      { isRead: true },
      { where: { id: req.params.id, userId: req.user.id } }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const notification = await Notification.findByPk(req.params.id);
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Notification.destroy({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create notification (internal use)
router.post('/', auth, async (req, res) => {
  try {
    // Only allow admins or system to create notifications
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const notification = await Notification.create(req.body);
    
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
