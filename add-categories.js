require('dotenv').config();
const { Category } = require('./models');

async function addMissingCategories() {
  try {
    await Category.bulkCreate([
      { name: 'Film', slug: 'film', description: 'African cinema and film industry', color: '#A855F7', order: 4, isActive: true },
      { name: 'Technology', slug: 'technology', description: 'Tech innovation in Africa', color: '#3B82F6', order: 5, isActive: true },
      { name: 'Investor Relations', slug: 'investor-relations', description: 'Investment opportunities for diaspora', color: '#10B981', order: 6, isActive: true },
    ], { ignoreDuplicates: true });
    
    console.log('✓ Added missing categories');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addMissingCategories();
