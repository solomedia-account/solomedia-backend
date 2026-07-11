const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { auth } = require('../middleware/auth');

// Get user preferences
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['preferences']
    });
    res.json(user.preferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user preferences
router.put('/', auth, async (req, res) => {
  try {
    const { emailNotifications, newsletter, darkMode, language } = req.body;
    
    const preferences = {
      emailNotifications,
      newsletter,
      darkMode,
      language
    };

    await User.update(
      { preferences },
      { where: { id: req.user.id } }
    );

    const user = await User.findByPk(req.user.id, {
      attributes: ['preferences']
    });

    res.json(user.preferences);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle email notifications
router.put('/email-notifications', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const currentPreferences = user.preferences || {};
    currentPreferences.emailNotifications = !currentPreferences.emailNotifications;
    
    await user.update({ preferences: currentPreferences });
    
    res.json({ emailNotifications: currentPreferences.emailNotifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle newsletter
router.put('/newsletter', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const currentPreferences = user.preferences || {};
    currentPreferences.newsletter = !currentPreferences.newsletter;
    
    await user.update({ preferences: currentPreferences });
    
    res.json({ newsletter: currentPreferences.newsletter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
