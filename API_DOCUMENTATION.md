# SoloMedia Backend API Documentation

## User Roles & Permissions

### Role Hierarchy
1. **Admin** - Full system access
2. **Editor** - Content management and user oversight
3. **Author** - Create and manage own content
4. **Subscriber** - Read-only access with basic profile features

### Permission Matrix

| Feature | Admin | Editor | Author | Subscriber |
|---------|-------|--------|--------|------------|
| Create Articles | ✅ | ✅ | ✅ | ❌ |
| Edit Any Article | ✅ | ✅ | ❌ | ❌ |
| Edit Own Article | ✅ | ✅ | ✅ | ❌ |
| Delete Any Article | ✅ | ✅ | ❌ | ❌ |
| Manage Categories | ✅ | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| View Dashboard | ✅ | ✅ | ✅ | ❌ |
| View System Overview | ✅ | ❌ | ❌ | ❌ |
| Manage Profile | ✅ | ✅ | ✅ | ✅ |
| Set Preferences | ✅ | ✅ | ✅ | ✅ |
| Receive Notifications | ✅ | ✅ | ✅ | ✅ |

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "subscriber"
  }
}
```

### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "author"
  }
}
```

---

## User Management Endpoints

### GET /api/users/me
Get current user profile (authenticated).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "author",
  "bio": "Writer and content creator",
  "avatar": "avatar_url",
  "location": "New York",
  "website": "https://johndoe.com",
  "socialLinks": {
    "twitter": "@johndoe",
    "instagram": "@johndoe",
    "linkedin": "johndoe",
    "youtube": "johndoe"
  },
  "preferences": {
    "emailNotifications": true,
    "newsletter": true,
    "darkMode": true,
    "language": "en"
  },
  "stats": {
    "articlesPublished": 15,
    "articlesViews": 5000,
    "followers": 120,
    "following": 45
  },
  "isActive": true,
  "isVerified": true,
  "lastLogin": "2024-01-15T10:30:00Z",
  "createdAt": "2023-06-01T00:00:00Z"
}
```

### PUT /api/users/me
Update current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "bio": "Updated bio",
  "location": "Los Angeles",
  "website": "https://newsite.com",
  "socialLinks": {
    "twitter": "@newhandle"
  }
}
```

### GET /api/users
Get all users (Admin/Editor only).

**Query Parameters:**
- `limit`: Number of users per page (default: 20)
- `page`: Page number (default: 1)
- `role`: Filter by role

**Response:**
```json
{
  "users": [...],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 100
  }
}
```

### PUT /api/users/:id/role
Update user role (Admin only).

**Request Body:**
```json
{
  "role": "editor"
}
```

---

## Profile Management Endpoints

### GET /api/profile
Get own extended profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "profile_id",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "avatar": "avatar_url",
    "role": "author",
    "isVerified": true,
    "stats": {...}
  },
  "displayName": "John Doe",
  "headline": "Content Creator & Writer",
  "about": "Detailed about section...",
  "expertise": ["Technology", "Culture", "Music"],
  "interests": ["Travel", "Photography", "Reading"],
  "portfolio": [
    {
      "title": "Project Name",
      "description": "Project description",
      "url": "https://project.com",
      "imageUrl": "image_url"
    }
  ],
  "achievements": [
    {
      "title": "Award Name",
      "description": "Award description",
      "date": "2024-01-01"
    }
  ],
  "contact": {
    "email": "john@example.com",
    "phone": "+1234567890",
    "showEmail": true,
    "showPhone": false
  },
  "socialMedia": {
    "twitter": "@johndoe",
    "instagram": "@johndoe",
    "linkedin": "johndoe",
    "youtube": "johndoe",
    "tiktok": "@johndoe"
  },
  "settings": {
    "profileVisibility": "public",
    "showStats": true,
    "allowMessages": true
  }
}
```

### PUT /api/profile
Create or update profile.

**Request Body:**
```json
{
  "displayName": "John Doe",
  "headline": "Content Creator",
  "about": "About me...",
  "expertise": ["Technology"],
  "interests": ["Travel"],
  "settings": {
    "profileVisibility": "public"
  }
}
```

### GET /api/profile/:userId
Get public profile of another user.

**Response:** Same as own profile, respecting visibility settings.

### PUT /api/profile/visibility
Update profile visibility.

**Request Body:**
```json
{
  "profileVisibility": "private"
}
```

**Visibility Options:**
- `public` - Anyone can view
- `private` - Only user can view
- `connections` - Only followers can view

### POST /api/profile/portfolio
Add portfolio item.

**Request Body:**
```json
{
  "title": "New Project",
  "description": "Project description",
  "url": "https://project.com",
  "imageUrl": "image_url"
}
```

### PUT /api/profile/portfolio/:itemId
Update portfolio item.

### DELETE /api/profile/portfolio/:itemId
Delete portfolio item.

---

## Preferences Endpoints

### GET /api/preferences
Get user preferences.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "emailNotifications": true,
  "newsletter": true,
  "darkMode": true,
  "language": "en"
}
```

### PUT /api/preferences
Update user preferences.

**Request Body:**
```json
{
  "emailNotifications": false,
  "newsletter": true,
  "darkMode": false,
  "language": "fr"
}
```

### PUT /api/preferences/email-notifications
Toggle email notifications.

### PUT /api/preferences/newsletter
Toggle newsletter subscription.

---

## Notifications Endpoints

### GET /api/notifications
Get user notifications.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `unreadOnly`: Filter unread only (true/false)
- `limit`: Items per page (default: 20)
- `page`: Page number (default: 1)

**Response:**
```json
{
  "notifications": [
    {
      "_id": "notification_id",
      "type": "article_published",
      "title": "Your article was published",
      "message": "Your article 'Title' has been published",
      "link": "/article/slug",
      "isRead": false,
      "metadata": {...},
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 3,
    "total": 50
  },
  "unreadCount": 5
}
```

**Notification Types:**
- `article_published` - Article published
- `comment_received` - New comment on article
- `user_followed` - User followed you
- `system_update` - System announcement
- `article_approved` - Article approved by editor
- `article_rejected` - Article rejected by editor

### PUT /api/notifications/:id/read
Mark notification as read.

### PUT /api/notifications/read-all
Mark all notifications as read.

### DELETE /api/notifications/:id
Delete notification.

---

## Dashboard Endpoints

### GET /api/dashboard/stats
Get dashboard statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "articles": {
    "total": 25,
    "published": 20,
    "draft": 5,
    "views": 15000
  },
  "notifications": {
    "unread": 3
  },
  "activity": {
    "recent": 15
  }
}
```

### GET /api/dashboard/articles
Get recent articles for dashboard.

**Query Parameters:**
- `limit`: Number of articles (default: 5)

**Response:**
```json
[
  {
    "_id": "article_id",
    "title": "Article Title",
    "status": "published",
    "views": 500,
    "updatedAt": "2024-01-15T10:00:00Z",
    "author": {...},
    "category": {...}
  }
]
```

### GET /api/dashboard/activity
Get recent user activity.

**Query Parameters:**
- `limit`: Number of activities (default: 10)

**Response:**
```json
[
  {
    "_id": "activity_id",
    "type": "article_created",
    "description": "Created article 'Title'",
    "metadata": {...},
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

### GET /api/dashboard/users
Get user list (Admin/Editor only).

**Query Parameters:**
- `limit`: Users per page (default: 20)
- `page`: Page number (default: 1)
- `role`: Filter by role

### GET /api/dashboard/overview
Get system overview (Admin only).

**Response:**
```json
{
  "users": {
    "total": 1500,
    "active": 1400,
    "verified": 800,
    "byRole": [
      { "_id": "subscriber", "count": 1000 },
      { "_id": "author", "count": 300 },
      { "_id": "editor", "count": 150 },
      { "_id": "admin", "count": 50 }
    ]
  },
  "articles": {
    "total": 5000,
    "published": 4500,
    "draft": 500,
    "totalViews": 1000000
  },
  "activity": {
    "today": 200,
    "thisWeek": 1200
  }
}
```

---

## Activity Tracking Endpoints

### POST /api/activities
Log user activity.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "article_viewed",
  "description": "Viewed article 'Title'",
  "metadata": {
    "articleId": "article_id",
    "articleSlug": "article-slug"
  }
}
```

**Activity Types:**
- `article_created` - Article created
- `article_updated` - Article updated
- `article_deleted` - Article deleted
- `article_viewed` - Article viewed
- `comment_added` - Comment added
- `user_followed` - User followed
- `profile_updated` - Profile updated
- `login` - User login

### GET /api/activities
Get user activities.

**Query Parameters:**
- `type`: Filter by activity type
- `limit`: Items per page (default: 20)
- `page`: Page number (default: 1)

### GET /api/activities/type/:type
Get activities by type.

### DELETE /api/activities/:id
Delete activity (own activities only).

---

## Article Endpoints

### GET /api/articles
Get all published articles.

**Query Parameters:**
- `category`: Filter by category ID
- `featured`: Filter featured articles (true/false)
- `limit`: Items per page (default: 20)
- `page`: Page number (default: 1)

### GET /api/articles/:slug
Get single article by slug.

### POST /api/articles
Create article (Admin/Editor/Author).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Article Title",
  "slug": "article-slug",
  "excerpt": "Article excerpt",
  "content": "<p>Article content in HTML</p>",
  "category": "category_id",
  "tags": ["tag1", "tag2"],
  "featuredImage": "image_url",
  "status": "draft",
  "isFeatured": false
}
```

### PUT /api/articles/:id
Update article (Admin/Editor/Author - own articles only).

### DELETE /api/articles/:id
Delete article (Admin/Editor only).

---

## Category Endpoints

### GET /api/categories
Get all categories.

### GET /api/categories/:slug
Get single category.

### POST /api/categories
Create category (Admin/Editor).

### PUT /api/categories/:id
Update category (Admin/Editor).

### DELETE /api/categories/:id
Delete category (Admin only).

---

## Error Responses

All endpoints may return error responses:

**400 Bad Request:**
```json
{
  "message": "Validation error details"
}
```

**401 Unauthorized:**
```json
{
  "message": "No authentication token, access denied"
}
```

**403 Forbidden:**
```json
{
  "message": "Not authorized to access this route"
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Something went wrong!"
}
```

---

## Rate Limiting

Consider implementing rate limiting for:
- Authentication endpoints (5 requests per minute)
- Article creation (10 requests per hour)
- Activity logging (100 requests per minute)

---

## Security Best Practices

1. Always use HTTPS in production
2. Validate and sanitize all input
3. Use environment variables for sensitive data
4. Implement CORS properly
5. Use parameterized queries to prevent injection
6. Regularly update dependencies
7. Implement request logging for audit trails
