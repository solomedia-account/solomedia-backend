const express = require('express');
const router = express.Router();
const { Profile, User } = require('../models');
const { auth } = require('../middleware/auth');

// Get user profile (public or own)
router.get('/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      where: { userId: req.params.userId },
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'name', 'avatar', 'role', 'isVerified', 'stats'] 
        }
      ]
    });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const settings = profile.settings || {};
    
    // Check visibility settings
    if (settings.profileVisibility === 'private') {
      if (!req.user || req.user.id !== parseInt(req.params.userId)) {
        return res.status(403).json({ message: 'Profile is private' });
      }
    }

    // Hide stats if configured
    const profileData = profile.toJSON();
    if (settings.showStats === false && 
        (!req.user || req.user.id !== parseInt(req.params.userId))) {
      delete profileData.user.stats;
    }

    res.json(profileData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get own profile
router.get('/', auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ where: { userId: req.user.id } });
    
    if (!profile) {
      // Create profile if it doesn't exist
      profile = await Profile.create({ userId: req.user.id });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update profile
router.put('/', auth, async (req, res) => {
  try {
    const profileData = req.body;
    let profile = await Profile.findOne({ where: { userId: req.user.id } });

    if (profile) {
      await profile.update(profileData);
    } else {
      profile = await Profile.create({ userId: req.user.id, ...profileData });
    }

    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update profile visibility
router.put('/visibility', auth, async (req, res) => {
  try {
    const { profileVisibility } = req.body;
    
    const profile = await Profile.findOne({ where: { userId: req.user.id } });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const settings = profile.settings || {};
    settings.profileVisibility = profileVisibility;
    
    await profile.update({ settings });

    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add portfolio item
router.post('/portfolio', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { userId: req.user.id } });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const portfolio = profile.portfolio || [];
    portfolio.push(req.body);
    
    await profile.update({ portfolio });
    
    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update portfolio item
router.put('/portfolio/:itemId', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { userId: req.user.id } });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const portfolio = profile.portfolio || [];
    const itemIndex = parseInt(req.params.itemId);
    
    if (!portfolio[itemIndex]) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    portfolio[itemIndex] = { ...portfolio[itemIndex], ...req.body };
    
    await profile.update({ portfolio });
    
    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete portfolio item
router.delete('/portfolio/:itemId', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { userId: req.user.id } });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const portfolio = profile.portfolio || [];
    const itemIndex = parseInt(req.params.itemId);
    
    if (!portfolio[itemIndex]) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    portfolio.splice(itemIndex, 1);
    
    await profile.update({ portfolio });
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
