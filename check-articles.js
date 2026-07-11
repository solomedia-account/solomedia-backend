require('dotenv').config();
const { sequelize, Article } = require('./models');

async function checkArticles() {
  try {
    await sequelize.authenticate();
    console.log('Database connected\n');
    
    const articles = await Article.findAll({
      attributes: ['id', 'title', 'status', 'publishedAt', 'categoryId', 'slug']
    });
    
    console.log(`Total articles in database: ${articles.length}\n`);
    
    if (articles.length === 0) {
      console.log('No articles found in database.');
    } else {
      articles.forEach(a => {
        console.log(`- ${a.title}`);
        console.log(`  ID: ${a.id}`);
        console.log(`  Status: ${a.status}`);
        console.log(`  PublishedAt: ${a.publishedAt}`);
        console.log(`  Category: ${a.categoryId}`);
        console.log(`  Slug: ${a.slug}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkArticles();
