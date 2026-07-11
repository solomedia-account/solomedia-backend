require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('Testing Cloudinary connection...\n');

// Check if credentials are loaded
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ Loaded' : '✗ Missing');
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✓ Loaded' : '✗ Missing');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✓ Loaded' : '✗ Missing');

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.log('\n✗ Cloudinary credentials are missing in .env file');
  process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test connection by trying to list resources
console.log('\nTesting API connection...');
cloudinary.api.resources({ type: 'upload', max_results: 1 }, (error, result) => {
  if (error) {
    console.error('✗ Cloudinary connection failed:', error.message);
    process.exit(1);
  } else {
    console.log('✓ Cloudinary connection successful!');
    console.log(`✓ Found ${result.resources?.length || 0} resources in account`);
    process.exit(0);
  }
});
