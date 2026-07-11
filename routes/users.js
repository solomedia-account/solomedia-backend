const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { auth, authorize } = require('../middleware/auth');

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
  try {
    const allowedUpdates = ['name', 'bio', 'avatar', 'socialLinks', 'location', 'website'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.update(updates, {
      where: { id: req.user.id },
      returning: true
    });

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all users (admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { limit = 20, page = 1, role } = req.query;
    const where = role ? { role } : {};

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
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

// Update user role (admin only)
router.put('/:id/role', auth, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const [updated] = await User.update(
      { role },
      { where: { id: req.params.id } }
    );

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Verify user (admin only)
router.put('/:id/verify', auth, authorize('admin'), async (req, res) => {
  try {
    const [updated] = await User.update(
      { isVerified: true },
      { where: { id: req.params.id } }
    );

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Activate/deactivate user (admin only)
router.put('/:id/activate', auth, authorize('admin'), async (req, res) => {
  try {
    const { isActive } = req.body;
    const [updated] = await User.update(
      { isActive },
      { where: { id: req.params.id } }
    );

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id == req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const deleted = await User.destroy({ where: { id: req.params.id } });

    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
