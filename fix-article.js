require('dotenv').config();
const { sequelize, Article } = require('./models');

async function fixArticle() {
  try {
    await sequelize.authenticate();
    
    // Fix the article with URL as title
    const article = await Article.findByPk(7);
    if (article) {
      await article.update({
        title: 'AI Filter Wine Monotone',
        slug: 'ai-filter-wine-monotone'
      });
      console.log('Fixed article ID 7');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixArticle();
