require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Article = require('./models/Article');
const User = require('./models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/solomedia');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Article.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create categories
    const categories = await Category.create([
      {
        name: 'Fashion',
        slug: 'fashion',
        description: 'African fashion trends, designers, and style from the diaspora',
        color: '#FFD700',
        order: 1
      },
      {
        name: 'Arts',
        slug: 'arts',
        description: 'Visual arts, sculpture, and creative expressions from Africa',
        color: '#FF6B6B',
        order: 2
      },
      {
        name: 'Music',
        slug: 'music',
        description: 'Afrobeats, hip-hop, and traditional African music scenes',
        color: '#4ECDC4',
        order: 3
      },
      {
        name: 'Film',
        slug: 'film',
        description: 'Nollywood, African cinema, and diaspora filmmakers',
        color: '#95E1D3',
        order: 4
      },
      {
        name: 'Technology',
        slug: 'technology',
        description: 'Tech innovation, startups, and digital transformation in Africa',
        color: '#A78BFA',
        order: 5
      },
      {
        name: 'Investor Dynamics',
        slug: 'investor-dynamics',
        description: 'Investment opportunities and economic trends for the diaspora',
        color: '#F472B6',
        order: 6
      }
    ]);
    console.log('Created categories');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@solomedia.com',
      password: 'admin123',
      role: 'admin',
      bio: 'Site administrator'
    });
    console.log('Created admin user');

    // Create sample articles
    const articles = await Article.create([
      {
        title: 'The Rise of African Fashion in Global Markets',
        slug: 'rise-of-african-fashion-global-markets',
        excerpt: 'African fashion is taking the world by storm with designers showcasing their unique heritage on international runways.',
        content: '<p>African fashion has experienced a remarkable surge in global recognition over the past decade. Designers from across the continent are blending traditional textiles with modern aesthetics...</p>',
        author: adminUser._id,
        category: categories[0]._id,
        tags: ['fashion', 'design', 'global', 'runway'],
        status: 'published',
        isFeatured: true,
        publishedAt: new Date()
      },
      {
        title: 'Afrobeats: The Sound of a Generation',
        slug: 'afrobeats-sound-generation',
        excerpt: 'From Lagos to London, Afrobeats has become the soundtrack of the African diaspora, influencing music worldwide.',
        content: '<p>Afrobeats has evolved from a local Nigerian genre to a global phenomenon. Artists like Burna Boy, Wizkid, and Tems have achieved international acclaim...</p>',
        author: adminUser._id,
        category: categories[2]._id,
        tags: ['music', 'afrobeats', 'culture', 'diaspora'],
        status: 'published',
        isFeatured: true,
        publishedAt: new Date()
      },
      {
        title: 'Tech Startups Transforming African Cities',
        slug: 'tech-startups-transforming-african-cities',
        excerpt: 'Innovation hubs in Nairobi, Lagos, and Cape Town are breeding ground for the next generation of African tech entrepreneurs.',
        content: '<p>Africa\'s tech ecosystem is booming with startups solving local problems with innovative solutions. From fintech to agritech, the continent is embracing digital transformation...</p>',
        author: adminUser._id,
        category: categories[4]._id,
        tags: ['technology', 'startups', 'innovation', 'africa'],
        status: 'published',
        isFeatured: true,
        publishedAt: new Date()
      },
      {
        title: 'Nollywood: The Second Largest Film Industry',
        slug: 'nollywood-second-largest-film-industry',
        excerpt: 'Nigeria\'s film industry produces more movies annually than Hollywood and is a cultural force across Africa.',
        content: '<p>Nollywood has grown from humble beginnings to become the world\'s second-largest film industry by volume. Its stories resonate with audiences across the African diaspora...</p>',
        author: adminUser._id,
        category: categories[3]._id,
        tags: ['film', 'nollywood', 'cinema', 'nigeria'],
        status: 'published',
        publishedAt: new Date()
      },
      {
        title: 'Investment Opportunities in African Real Estate',
        slug: 'investment-opportunities-african-real-estate',
        excerpt: 'The African real estate market offers lucrative opportunities for diaspora investors looking to build wealth back home.',
        content: '<p>Real estate investment in Africa is gaining traction among diaspora communities seeking to diversify their portfolios while contributing to continental development...</p>',
        author: adminUser._id,
        category: categories[5]._id,
        tags: ['investment', 'real-estate', 'diaspora', 'business'],
        status: 'published',
        publishedAt: new Date()
      },
      {
        title: 'Contemporary African Art Goes Mainstream',
        slug: 'contemporary-african-art-mainstream',
        excerpt: 'African artists are breaking auction records and gaining recognition in major galleries worldwide.',
        content: '<p>Contemporary African art is experiencing unprecedented demand in global markets. Artists from Nigeria, South Africa, and Kenya are leading this renaissance...</p>',
        author: adminUser._id,
        category: categories[1]._id,
        tags: ['art', 'contemporary', 'gallery', 'auction'],
        status: 'published',
        publishedAt: new Date()
      }
    ]);
    console.log('Created sample articles');

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
