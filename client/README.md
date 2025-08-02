# LinkedIn Lite - Frontend

The React frontend for LinkedIn Lite, a modern social networking platform built with React 18, Vite, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
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
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open http://localhost:3000 in your browser

## 📁 Project Structure

```
client/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── CreatePost.jsx  # Post creation component
│   │   ├── EditProfile.jsx # Profile editing
│   │   ├── FriendsSection.jsx # Friends management
│   │   ├── LoadingSpinner.jsx # Loading animations
│   │   ├── Navbar.jsx      # Navigation bar
│   │   ├── PostCard.jsx    # Individual post display
│   │   ├── PrivateRoute.jsx # Protected routes
│   │   ├── ShareButton.jsx # Social sharing
│   │   ├── Toast.jsx       # Notification system
│   │   └── UserCard.jsx    # User profile cards
│   ├── contexts/           # React Context providers
│   │   ├── AuthContext.jsx # Authentication state
│   │   ├── FriendsContext.jsx # Friends management
│   │   ├── MessagesContext.jsx # Messaging state
│   │   ├── PostContext.jsx # Posts management
│   │   └── ToastContext.jsx # Toast notifications
│   ├── pages/              # Page components
│   │   ├── Feed.jsx        # Main feed page
│   │   ├── Friends.jsx     # Network management
│   │   ├── Homepage.jsx    # Landing page
│   │   ├── Login.jsx       # Login page
│   │   ├── Messages.jsx    # Messaging interface
│   │   ├── Profile.jsx     # User profiles
│   │   ├── Register.jsx    # Registration page
│   │   ├── SharedPost.jsx  # Shared post view
│   │   └── SharedProfile.jsx # Shared profile view
│   ├── services/           # API services
│   │   └── api.js          # Axios configuration
│   ├── App.jsx             # Main app component
│   ├── index.css           # Global styles
│   └── main.jsx            # App entry point
├── package.json
├── tailwind.config.js      # Tailwind configuration
└── vite.config.js          # Vite configuration
```

## 🎨 Key Components

### Authentication Components
- **Login.jsx** - User login with email/password and demo login
- **Register.jsx** - New user registration
- **PrivateRoute.jsx** - Route protection for authenticated users

### Social Features
- **Feed.jsx** - Main content feed with posts and statistics
- **Friends.jsx** - Network management with discover, pending requests, and connections
- **Messages.jsx** - Real-time messaging with mobile-optimized interface
- **Profile.jsx** - User profile display and editing

### Content Management
- **CreatePost.jsx** - Post creation with media upload support
- **PostCard.jsx** - Individual post display with interactions
- **UserCard.jsx** - User cards with friend request actions

### UI Components
- **Navbar.jsx** - Responsive navigation with user menu
- **LoadingSpinner.jsx** - Loading animations
- **Toast.jsx** - Notification system
- **ShareButton.jsx** - Social sharing functionality

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
```

## 🎯 Features

### Responsive Design
- Mobile-first approach
- WhatsApp-style mobile messaging
- Responsive navigation and layouts
- Touch-friendly interactions

### State Management
- React Context API for global state
- Separate contexts for different features
- Optimistic updates for better UX

### User Experience
- Loading states with spinners
- Toast notifications for feedback
- Smooth animations and transitions
- Error handling and recovery

### Performance
- Code splitting with React Router
- Optimized bundle with Vite
- Lazy loading for better performance
- Efficient re-renders with React hooks

## 🛠️ Configuration

### Tailwind CSS
The project uses Tailwind CSS for styling. Configuration is in `tailwind.config.js`:
- Custom color palette
- Responsive breakpoints
- Custom animations
- Component-specific styles

### Vite Configuration
Vite is configured in `vite.config.js`:
- React plugin
- Development server settings
- Build optimization
- Environment variables

### Environment Variables
- `VITE_API_URL` - Backend API URL
- All variables must be prefixed with `VITE_` to be accessible in the browser

## 📱 Mobile Optimization

### Responsive Breakpoints
- Mobile: `< 640px`
- Tablet: `640px - 1024px`
- Desktop: `> 1024px`

### Mobile Features
- Touch-friendly buttons
- Swipe gestures
- Mobile-optimized chat interface
- Responsive image handling
- Mobile navigation menu

## 🔒 Security

### Authentication
- JWT token management
- Automatic token refresh
- Protected routes
- Secure API calls

### Data Validation
- Client-side form validation
- Input sanitization
- Error boundary implementation
- Safe navigation with optional chaining

## 🚀 Deployment

The frontend is optimized for deployment on Vercel:

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository
   - Vercel will automatically detect the Vite configuration
   - Set environment variables in Vercel dashboard

3. **Environment Variables**
   - `VITE_API_URL` - Your backend API URL

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Profile creation and editing
- [ ] Friend request sending/accepting
- [ ] Post creation and viewing
- [ ] Messaging functionality
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Loading states

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Follow the existing code style
2. Use meaningful component and variable names
3. Add proper error handling
4. Test on mobile devices
5. Update documentation for new features

## 📄 License

This project is licensed under the MIT License.

---

**Part of the LinkedIn Lite Project** 