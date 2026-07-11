require('dotenv').config();
const { sequelize, Category } = require('./models');

async function checkCategories() {
  try {
    await sequelize.authenticate();
    console.log('Database connected\n');
    
    const categories = await Category.findAll({
      attributes: ['id', 'name', 'slug', 'isActive']
    });
    
    console.log(`Total categories in database: ${categories.length}\n`);
    
    if (categories.length === 0) {
      console.log('No categories found in database.');
    } else {
      categories.forEach(c => {
        console.log(`- ${c.name}`);
        console.log(`  ID: ${c.id}`);
        console.log(`  Slug: ${c.slug}`);
        console.log(`  Active: ${c.isActive}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkCategories();
