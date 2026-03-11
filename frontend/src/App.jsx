import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Browse from './pages/Browse'
import Video from './pages/Video'
import Login from './pages/Login'
import Upload from './pages/Upload'
import Register from './pages/Register'
import Profile from './pages/Profile'
import MyVideos from './pages/MyVideos'
import HowItWorks from './pages/HowItWorks'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import RequireAuth from './components/RequireAuth'

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<RequireAuth><Browse /></RequireAuth>} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pitch/:id" element={<RequireAuth><Video /></RequireAuth>} />
          <Route path="/my-pitches" element={<RequireAuth><MyVideos /></RequireAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/upload" element={<RequireAuth><Upload /></RequireAuth>} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App
