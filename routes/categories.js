const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const { auth, authorize } = require('../middleware/auth');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['order', 'ASC'], ['name', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single category by slug
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ where: { slug: req.params.slug } });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create category (protected)
router.post('/', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update category (protected)
router.put('/:id', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const [updated] = await Category.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (!updated) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const category = await Category.findByPk(req.params.id);
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete category (protected)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const deleted = await Category.destroy({ where: { id: req.params.id } });
    
    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
