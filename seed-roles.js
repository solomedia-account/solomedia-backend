require('dotenv').config();
const { User, Category } = require('./models');

async function seedTestUsers() {
  try {
    console.log('Creating test users for all roles...\n');

    // Check if users already exist
    const existingUsers = await User.findAll();
    if (existingUsers.length > 0) {
      const forceReset = process.argv.includes('--force');
      if (forceReset) {
        console.log('Force reset enabled. Deleting existing users...');
        await User.destroy({ where: {} });
        console.log('Existing users deleted.\n');
      } else {
        console.log('Users already exist. Skipping seed.');
        console.log('Use --force flag to reset: node seed-roles.js --force');
        console.log('\nExisting users:');
        existingUsers.forEach(user => {
          console.log(`- ${user.name} (${user.email}) - ${user.role}`);
        });
        process.exit(0);
      }
    }

    // Create categories first (needed for articles)
    await Category.destroy({ where: {} }); // Clear existing categories
    const categories = await Category.bulkCreate([
      { name: 'Fashion', slug: 'fashion', description: 'African fashion trends', color: '#FFD700', order: 1, isActive: true },
      { name: 'Arts', slug: 'arts', description: 'Visual arts from Africa', color: '#FF6B6B', order: 2, isActive: true },
      { name: 'Music', slug: 'music', description: 'Afrobeats and African music', color: '#4ECDC4', order: 3, isActive: true },
    ]);
    console.log('Created categories');

    // Create test users for each role
    const users = [
      {
        name: 'Admin User',
        email: 'admin@solomedia.com',
        password: 'admin123',
        role: 'admin',
        bio: 'Site administrator with full access',
        isVerified: true,
        isActive: true
      },
      {
        name: 'Editor User',
        email: 'editor@solomedia.com',
        password: 'editor123',
        role: 'editor',
        bio: 'Content editor who reviews and publishes articles',
        isVerified: true,
        isActive: true
      },
      {
        name: 'Author User',
        email: 'author@solomedia.com',
        password: 'author123',
        role: 'author',
        bio: 'Content creator who writes articles',
        isVerified: true,
        isActive: true
      },
      {
        name: 'Subscriber User',
        email: 'subscriber@solomedia.com',
        password: 'subscriber123',
        role: 'subscriber',
        bio: 'Regular user who reads content',
        isVerified: true,
        isActive: true
      },
      {
        name: 'Unverified User',
        email: 'unverified@solomedia.com',
        password: 'unverified123',
        role: 'subscriber',
        bio: 'User awaiting verification',
        isVerified: false,
        isActive: true
      },
      {
        name: 'Inactive User',
        email: 'inactive@solomedia.com',
        password: 'inactive123',
        role: 'subscriber',
        bio: 'Deactivated user account',
        isVerified: true,
        isActive: false
      }
    ];

    const createdUsers = await User.bulkCreate(users, { individualHooks: true });
    console.log('\n✓ Test users created successfully!\n');

    console.log('========================================');
    console.log('TEST LOGIN CREDENTIALS');
    console.log('========================================\n');

    createdUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()}`);
      console.log(`  Email:    ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Status:   ${user.isVerified ? 'Verified' : 'Unverified'}, ${user.isActive ? 'Active' : 'Inactive'}`);
      console.log();
    });

    console.log('========================================');
    console.log('ROLE PERMISSIONS SUMMARY');
    console.log('========================================\n');

    console.log('ADMIN:');
    console.log('  ✓ Create, edit, delete any article');
    console.log('  ✓ Create, edit, delete categories');
    console.log('  ✓ Manage users (verify, activate, delete, change roles)');
    console.log('  ✓ View all analytics and system overview');
    console.log('  ✓ Approve/reject pending articles');
    console.log('  ✓ Create notifications');
    console.log();

    console.log('EDITOR:');
    console.log('  ✓ Create, edit, delete any article');
    console.log('  ✓ Create, edit categories');
    console.log('  ✓ View user list (read-only)');
    console.log('  ✓ View dashboard stats for all articles');
    console.log('  ✓ Approve/reject pending articles');
    console.log();

    console.log('AUTHOR:');
    console.log('  ✓ Create articles (submitted as pending_review)');
    console.log('  ✓ Edit own articles only');
    console.log('  ✓ View own dashboard stats');
    console.log('  ✓ Cannot delete articles');
    console.log('  ✓ Cannot manage categories or users');
    console.log();

    console.log('SUBSCRIBER:');
    console.log('  ✓ View published articles');
    console.log('  ✓ Manage own profile and preferences');
    console.log('  ✓ Cannot create/edit/delete articles');
    console.log('  ✓ Cannot manage categories or users');
    console.log();

    console.log('========================================');
    console.log('API ENDPOINTS BY ROLE');
    console.log('========================================\n');

    console.log('Articles:');
    console.log('  GET    /api/articles              - All (public)');
    console.log('  GET    /api/articles/:slug        - All (public)');
    console.log('  POST   /api/articles              - Admin, Editor, Author');
    console.log('  PUT    /api/articles/:id          - Admin, Editor, Author (own)');
    console.log('  DELETE /api/articles/:id          - Admin, Editor');
    console.log('  GET    /api/articles/review/pending - Admin, Editor');
    console.log('  PUT    /api/articles/:id/review   - Admin, Editor');
    console.log();

    console.log('Categories:');
    console.log('  GET    /api/categories            - All (public)');
    console.log('  POST   /api/categories            - Admin, Editor');
    console.log('  PUT    /api/categories/:id        - Admin, Editor');
    console.log('  DELETE /api/categories/:id        - Admin');
    console.log();

    console.log('Users:');
    console.log('  GET    /api/users                 - Admin, Editor');
    console.log('  PUT    /api/users/:id/role        - Admin');
    console.log('  PUT    /api/users/:id/verify      - Admin');
    console.log('  PUT    /api/users/:id/activate    - Admin');
    console.log('  DELETE /api/users/:id             - Admin');
    console.log();

    console.log('Dashboard:');
    console.log('  GET    /api/dashboard/stats       - All authenticated');
    console.log('  GET    /api/dashboard/articles    - All authenticated');
    console.log('  GET    /api/dashboard/users       - Admin, Editor');
    console.log('  GET    /api/dashboard/overview     - Admin only');
    console.log();

    process.exit(0);
  } catch (error) {
    console.error('Error seeding test users:', error.message);
    process.exit(1);
  }
}

seedTestUsers();
