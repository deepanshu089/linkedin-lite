import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PostProvider } from './contexts/PostContext'
import { FriendsProvider } from './contexts/FriendsContext'
import { MessagesProvider } from './contexts/MessagesContext'
import { ToastProvider } from './contexts/ToastContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import Homepage from './pages/Homepage'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import Friends from './pages/Friends'
import Messages from './pages/Messages'
import SharedPost from './pages/SharedPost'
import SharedProfile from './pages/SharedProfile'
import LoadingSpinner from './components/LoadingSpinner'
import { useState, useEffect } from 'react'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <ToastProvider>
      <AuthProvider>
        <PostProvider>
          <FriendsProvider>
            <MessagesProvider>
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Public shared routes */}
              <Route path="/shared/post/:postId" element={<SharedPost />} />
              <Route path="/shared/profile/:userId" element={<SharedProfile />} />
              
              <Route 
                path="/feed" 
                element={
                  <PrivateRoute>
                    <div className="min-h-screen">
                      <Navbar />
                      <Feed />
                    </div>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile/:id" 
                element={
                  <PrivateRoute>
                    <div className="min-h-screen">
                      <Navbar />
                      <Profile />
                    </div>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/friends" 
                element={
                  <PrivateRoute>
                    <div className="min-h-screen">
                      <Navbar />
                      <Friends />
                    </div>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/messages" 
                element={
                  <PrivateRoute>
                    <div className="min-h-screen">
                      <Navbar />
                      <Messages />
                    </div>
                  </PrivateRoute>
                } 
              />
            </Routes>
            </MessagesProvider>
          </FriendsProvider>
        </PostProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App 