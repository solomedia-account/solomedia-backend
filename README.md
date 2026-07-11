# SoloMedia Backend

REST API for SoloMedia - African culture and diaspora media platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Seed database
node seed.js

# Start development server
npm run dev
```

## 📡 API Documentation

### Base URL
`http://localhost:5000/api`

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Authentication
- `POST /auth/register` - Register new user
  - Body: `{ name, email, password }`
- `POST /auth/login` - Login user
  - Body: `{ email, password }`

#### Articles
- `GET /articles` - Get all published articles
  - Query params: `category`, `featured`, `limit`, `page`
- `GET /articles/:slug` - Get single article
- `POST /articles` - Create article (auth required)
- `PUT /articles/:id` - Update article (auth required)
- `DELETE /articles/:id` - Delete article (auth required)

#### Categories
- `GET /categories` - Get all categories
- `GET /categories/:slug` - Get single category
- `POST /categories` - Create category (auth required)
- `PUT /categories/:id` - Update category (auth required)
- `DELETE /categories/:id` - Delete category (auth required)

#### Users
- `GET /users/me` - Get current user (auth required)
- `PUT /users/me` - Update profile (auth required)
- `GET /users` - Get all users (admin only)
- `PUT /users/:id/role` - Update user role (admin only)

## 🗄️ Database Models

### User
- name, email, password (hashed)
- role: admin, editor, author, subscriber
- bio, avatar, socialLinks
- createdAt

### Article
- title, slug, excerpt, content
- author (ref: User)
- category (ref: Category)
- tags, featuredImage
- status: draft, published, archived
- isFeatured, views
- publishedAt, createdAt, updatedAt

### Category
- name, slug, description
- icon, color, order
- isActive, createdAt

## 🔐 Security

- Passwords hashed with bcryptjs
- JWT tokens for authentication
- Role-based access control
- CORS enabled for frontend integration
