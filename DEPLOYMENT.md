# 🚀 LinkedIn Lite Deployment Guide

This guide will help you deploy your LinkedIn Lite social media application to production.

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup

**Frontend (.env file in client folder):**
```env
REACT_APP_API_URL=https://your-backend-url.com
```

**Backend (.env file in server folder):**
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret_key
PORT=5000
NODE_ENV=production
```

### 2. Update API Configuration

Make sure your frontend is configured to use the production API URL:

**client/src/services/api.js:**
```javascript
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000'
```

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - Configure build settings:
     - **Framework Preset**: Vite
     - **Build Command**: `cd client && npm run build`
     - **Output Directory**: `client/dist`
     - **Install Command**: `npm install`

3. **Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add: `REACT_APP_API_URL=https://your-backend-url.com`

### Option 2: Netlify

1. **Push to GitHub** (same as above)

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub
   - Click "New site from Git"
   - Choose your repository
   - Configure build settings:
     - **Build command**: `cd client && npm run build`
     - **Publish directory**: `client/dist`

3. **Environment Variables**
   - In Netlify dashboard, go to Site settings → Environment variables
   - Add: `REACT_APP_API_URL=https://your-backend-url.com`

## 🔧 Backend Deployment

### Option 1: Railway (Recommended)

1. **Prepare for Railway**
   - Create `Procfile` in server folder:
     ```
     web: npm start
     ```

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Create new project from GitHub
   - Select your repository

3. **Add MongoDB Database**
   - Click "New" → "Database" → "MongoDB"
   - Railway will automatically connect it to your app

4. **Environment Variables**
   - In Railway dashboard, go to Variables tab
   - Add:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_secure_jwt_secret
     PORT=5000
     NODE_ENV=production
     ```

### Option 2: Render

1. **Prepare for Render**
   - Create `render.yaml` in root folder:
     ```yaml
     services:
       - type: web
         name: linkedin-lite-backend
         env: node
         buildCommand: cd server && npm install
         startCommand: cd server && npm start
         envVars:
           - key: MONGODB_URI
             value: your_mongodb_connection_string
           - key: JWT_SECRET
             value: your_secure_jwt_secret
           - key: NODE_ENV
             value: production
     ```

2. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub
   - Create new Web Service
   - Connect your repository
   - Configure:
     - **Build Command**: `cd server && npm install`
     - **Start Command**: `cd server && npm start`
     - **Environment**: Node

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Deploy to Heroku**
   ```bash
   cd server
   heroku create your-app-name
   heroku config:set MONGODB_URI=your_mongodb_connection_string
   heroku config:set JWT_SECRET=your_secure_jwt_secret
   heroku config:set NODE_ENV=production
   git push heroku main
   ```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "FREE" tier
   - Select cloud provider and region
   - Click "Create"

3. **Configure Database Access**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and password
   - Select "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for production)

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### Railway MongoDB (Alternative)

If using Railway for backend:
1. Railway automatically provides MongoDB
2. Connection string is automatically set in environment variables
3. No additional setup needed

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./client
```

## 🧪 Testing Deployment

### 1. Test Frontend
- Visit your deployed frontend URL
- Test login/register functionality
- Test creating posts and messages

### 2. Test Backend
- Test API endpoints using Postman or similar
- Verify database connections
- Check environment variables

### 3. Common Issues & Solutions

**CORS Errors:**
- Add your frontend URL to CORS configuration in server
- Update `server/server.js`:
  ```javascript
  app.use(cors({
    origin: ['https://your-frontend-url.com', 'http://localhost:3000'],
    credentials: true
  }))
  ```

**Environment Variables Not Working:**
- Double-check variable names
- Restart deployment after adding variables
- Check deployment logs

**Build Failures:**
- Check package.json scripts
- Verify all dependencies are installed
- Check for TypeScript errors

## 📊 Monitoring & Analytics

### 1. Error Tracking
- Add Sentry for error monitoring
- Set up logging for backend

### 2. Performance Monitoring
- Use Vercel Analytics (if using Vercel)
- Set up Google Analytics

## 🔒 Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure JWT secret
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up proper MongoDB access controls

## 🎉 Post-Deployment

1. **Update README.md** with live URLs
2. **Test all features** thoroughly
3. **Monitor performance** and errors
4. **Set up backups** for database
5. **Configure custom domain** (optional)

## 📞 Support

If you encounter issues:
1. Check deployment logs
2. Verify environment variables
3. Test locally with production settings
4. Check platform-specific documentation

---

**Happy Deploying! 🚀** 