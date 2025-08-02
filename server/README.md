# LinkedIn Lite - Backend

The Node.js backend for LinkedIn Lite, a modern social networking platform built with Express.js, MongoDB, and JWT authentication.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/linkedin-lite
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the API**
   - API Base URL: http://localhost:5000/api
   - Health Check: http://localhost:5000/health

## 📁 Project Structure

```
server/
├── models/                 # Mongoose models
│   ├── Message.js         # Message schema
│   ├── Post.js            # Post schema
│   └── User.js            # User schema
├── routes/                 # API routes
│   ├── auth.js            # Authentication routes
│   ├── friends.js         # Friends management
│   ├── messages.js        # Messaging routes
│   ├── posts.js           # Posts management
│   └── users.js           # User management
├── middleware/             # Custom middleware
│   ├── auth.js            # JWT authentication
│   └── upload.js          # File upload handling
├── uploads/                # File uploads directory
├── server.js              # Server entry point
└── package.json
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run build        # Build for production (if needed)

# Database
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database (development only)
```

## 📡 API Endpoints

### Authentication (`/api/auth`)

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST `/api/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### POST `/api/auth/demo-login`
Quick access with demo account.

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "demo_user_id",
    "name": "Demo User",
    "email": "demo@linkedinlite.com"
  }
}
```

#### GET `/api/auth/me`
Get current user information.

**Headers:** `Authorization: Bearer <token>`

### Users (`/api/users`)

#### GET `/api/users`
Get all users (for discovery).

#### GET `/api/users/:id`
Get specific user by ID.

#### PUT `/api/users/profile`
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Name",
  "bio": "Updated bio",
  "avatar": "avatar_url"
}
```

#### GET `/api/users/feed-stats`
Get user statistics for feed.

### Posts (`/api/posts`)

#### GET `/api/posts`
Get all posts with pagination.

#### POST `/api/posts`
Create a new post.

**Headers:** `Authorization: Bearer <token>`

**Request Body (FormData):**
```
content: "Post content"
media: [files] (optional)
```

#### DELETE `/api/posts/:id`
Delete a post.

**Headers:** `Authorization: Bearer <token>`

#### GET `/api/posts/feed-stats`
Get post statistics.

### Friends (`/api/friends`)

#### GET `/api/friends`
Get user's friends and pending requests.

**Headers:** `Authorization: Bearer <token>`

#### POST `/api/friends/send/:userId`
Send friend request to user.

**Headers:** `Authorization: Bearer <token>`

#### POST `/api/friends/accept/:userId`
Accept friend request.

**Headers:** `Authorization: Bearer <token>`

#### POST `/api/friends/reject/:userId`
Reject friend request.

**Headers:** `Authorization: Bearer <token>`

#### DELETE `/api/friends/remove/:userId`
Remove friend from network.

**Headers:** `Authorization: Bearer <token>`

### Messages (`/api/messages`)

#### GET `/api/messages`
Get all conversations for current user.

**Headers:** `Authorization: Bearer <token>`

#### POST `/api/messages/:userId`
Send message to user.

**Headers:** `Authorization: Bearer <token>`

**Request Body (FormData):**
```
content: "Message content" (optional)
media: [files] (optional)
```

#### GET `/api/messages/:userId`
Get conversation with specific user.

**Headers:** `Authorization: Bearer <token>`

#### GET `/api/messages/feed-stats`
Get message statistics.

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  bio: String,
  avatar: String,
  friends: [ObjectId],
  friendRequests: [{
    from: ObjectId,
    status: String
  }]
}
```

### Post Model
```javascript
{
  user: ObjectId,
  content: String,
  media: [{
    url: String,
    type: String
  }],
  likes: [ObjectId],
  comments: [{
    user: ObjectId,
    content: String,
    createdAt: Date
  }]
}
```

### Message Model
```javascript
{
  sender: ObjectId,
  receiver: ObjectId,
  content: String,
  media: [{
    url: String,
    type: String
  }],
  read: Boolean
}
```

## 🔒 Security Features

### Authentication
- JWT token-based authentication
- Password hashing with bcryptjs
- Token expiration and refresh
- Protected route middleware

### Data Validation
- Input sanitization
- Request validation
- Error handling middleware
- CORS configuration

### File Upload Security
- File type validation
- File size limits
- Secure file storage
- Virus scanning (recommended for production)

## 🛠️ Middleware

### Authentication Middleware
```javascript
// Protects routes requiring authentication
const auth = require('./middleware/auth');
app.use('/api/protected', auth);
```

### File Upload Middleware
```javascript
// Handles multipart form data
const upload = require('./middleware/upload');
app.post('/api/upload', upload.array('media', 5));
```

### Error Handling
- Global error handler
- Custom error responses
- Validation error formatting
- Database error handling

## 📊 Database Operations

### MongoDB Connection
```javascript
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

### Aggregation Pipelines
- User statistics calculation
- Post analytics
- Message counts
- Friend network analysis

### Indexes
- Email uniqueness
- User search optimization
- Post timestamp indexing
- Message conversation indexing

## 🚀 Deployment

### Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/linkedin-lite
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
NODE_ENV=production
```

### Production Considerations
- Use environment variables for secrets
- Enable HTTPS in production
- Set up proper CORS origins
- Configure rate limiting
- Set up monitoring and logging
- Use PM2 or similar process manager

### Railway Deployment
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push
4. Configure custom domain (optional)

## 🧪 Testing

### API Testing
Use tools like Postman or curl to test endpoints:

```bash
# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@linkedinlite.com","password":"demo123"}'

# Test protected route
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Database Testing
```bash
# Test database connection
npm run db:test

# Seed test data
npm run db:seed
```

## 📈 Performance

### Optimization Techniques
- Database indexing
- Query optimization
- Response caching
- File compression
- Connection pooling

### Monitoring
- Request/response logging
- Error tracking
- Performance metrics
- Database query analysis

## 🔧 Configuration

### CORS Settings
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### File Upload Limits
```javascript
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5
  }
});
```

### JWT Configuration
```javascript
const jwt = require('jsonwebtoken');
const token = jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRE
});
```

## 🤝 Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include input validation
4. Write clear API documentation
5. Test all endpoints
6. Update this README for new features

## 📄 License

This project is licensed under the MIT License.

---

**Part of the LinkedIn Lite Project** 