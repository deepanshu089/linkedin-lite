# LinkedIn Lite 🚀

A modern, full-stack social networking platform inspired by LinkedIn, built with React, Node.js, and MongoDB. Connect with professionals, share your story, and build your network in a clean, intuitive interface.

![LinkedIn Lite](https://img.shields.io/badge/LinkedIn-Lite-blue?style=for-the-badge&logo=linkedin)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-47A248?style=for-the-badge&logo=mongodb)

## ✨ Features

### 🔐 Authentication & User Management
- **Secure JWT Authentication** - Token-based authentication with refresh capabilities
- **User Registration & Login** - Complete user account management
- **Demo Account** - Quick access with pre-configured demo user
- **Profile Management** - Edit profile information, bio, and avatar
- **Profile Sharing** - Share your profile with unique URLs

### 📱 Social Networking
- **Friend System** - Send, accept, and reject friend requests
- **Network Management** - View your connections and discover new people
- **User Discovery** - Find and connect with other professionals
- **Friend Requests** - Manage incoming and outgoing requests

### 📝 Content Creation & Sharing
- **Post Creation** - Share text posts with rich formatting
- **Media Upload** - Support for images and videos in posts
- **Story Sharing** - "Share Your Story" feature for quick updates
- **Post Interaction** - Like, comment, and share posts
- **Content Feed** - Personalized feed with posts from your network

### 💬 Real-time Messaging
- **Direct Messaging** - Private conversations with friends
- **Media Sharing** - Send images and videos in messages
- **Message History** - Persistent chat history
- **Mobile-optimized Chat** - WhatsApp-style mobile interface
- **Auto-scroll** - Automatic scrolling to latest messages

### 📊 Analytics & Insights
- **Network Statistics** - View total posts, users, and messages
- **Activity Tracking** - Monitor your social activity
- **Dynamic Counts** - Real-time statistics on the feed page

### 🎨 Modern UI/UX
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Dark/Light Theme** - Beautiful gradient backgrounds and modern styling
- **Loading States** - Smooth loading animations and spinners
- **Toast Notifications** - User-friendly feedback system
- **Mobile-first Approach** - Optimized for mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icon library
- **Context API** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing
- **bcryptjs** - Password hashing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server with auto-restart

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd linkedin-lite
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   
   **Server (.env)**
   ```bash
   cd server
   cp env.example .env
   ```
   
   Edit `server/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/linkedin-lite
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   ```

   **Client (.env)**
   ```bash
   cd client
   cp env.example .env
   ```
   
   Edit `client/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the application**
   ```bash
   # Start server (from server directory)
   npm run dev
   
   # Start client (from client directory, in new terminal)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📱 Usage

### Getting Started
1. **Register** a new account or use the **Demo Login** for quick access
2. **Complete your profile** with bio and avatar
3. **Discover people** in the Network section
4. **Send friend requests** to connect with others
5. **Share your story** and create posts
6. **Start messaging** with your connections

### Key Features Walkthrough

#### 🔗 Network Management
- Navigate to "Network" to discover new people
- Send friend requests to connect
- Accept/reject incoming requests
- View your current connections

#### 📝 Content Creation
- Use "Share Your Story" for quick updates
- Create detailed posts with media
- Interact with posts from your network

#### 💬 Messaging
- Access messages from the navigation
- Start conversations with friends
- Share media in messages
- Enjoy mobile-optimized chat interface

## 🏗️ Project Structure

```
linkedin-lite/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── main.jsx        # App entry point
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── uploads/            # File uploads
│   └── server.js           # Server entry point
├── DEPLOYMENT.md           # Deployment guide
└── README.md              # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/demo-login` - Demo account login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update profile
- `GET /api/users/feed-stats` - Get user statistics

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/feed-stats` - Get post statistics

### Friends
- `GET /api/friends` - Get friends and requests
- `POST /api/friends/send/:userId` - Send friend request
- `POST /api/friends/accept/:userId` - Accept friend request
- `POST /api/friends/reject/:userId` - Reject friend request
- `DELETE /api/friends/remove/:userId` - Remove friend

### Messages
- `GET /api/messages` - Get conversations
- `POST /api/messages/:userId` - Send message
- `GET /api/messages/:userId` - Get conversation with user
- `GET /api/messages/feed-stats` - Get message statistics

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Vercel (frontend) and Railway (backend).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **LinkedIn** for inspiration
- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first approach
- **MongoDB** for the flexible database
- **Vercel & Railway** for hosting solutions

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ by the LinkedIn Lite Team** 