require('dotenv').config();
const { User } = require('./models');

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@solomedia.com' } });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@solomedia.com',
      password: 'admin123',
      role: 'admin',
      bio: 'Site administrator',
      isVerified: true
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@solomedia.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
