import React, { useEffect, useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import { useSpotifyData } from './hooks/useSpotifyData'
import queryString from "query-string"

// Components
import MainPage from "./components/main-page.jsx"
import NavBar from "./components/nav-bar.jsx"
import LoginPage from "./components/login-page.jsx"
import AboutPage from "./components/about-page.jsx"
import AudioFeaturesPage from "./components/audio-features-page.jsx"

// Chart.js configuration for React 18
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
)

function AppContent() {
  const { accessToken, setAccessToken, isDemoMode } = useStore()
  const [ isInitialized, setIsInitialized ] = useState(false)
  const hasActiveSession = accessToken || isDemoMode
  
  useSpotifyData()

  useEffect(() => {
    // Parse access token from URL on mount
    const parsed = queryString.parse(window.location.search)
    if (parsed.access_token && !accessToken) {
      console.log('Setting access token from URL')
      setAccessToken(parsed.access_token)
      // Clean up the URL after setting the token
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    setIsInitialized(true)
  }, [accessToken, setAccessToken])

  // Don't render anything until data has been fetched
  if (!isInitialized) {
    return (
      <div className="App">
        <div className="container text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Initializing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <Router>
        <NavBar />
        <Routes>
          {/* Redirect /main to / for backward compatibility */}
          <Route 
            path="/main" 
            element={<Navigate to="/" replace />}
          />
          
          {/* Main route */}
          <Route 
            path="/" 
            element={
              hasActiveSession ? (
                <MainPage />
              ) : (
                <LoginPage />
              )
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/about" 
            element={
              hasActiveSession ? <AboutPage /> : <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/audio-features" 
            element={
              hasActiveSession ? <AudioFeaturesPage /> : <Navigate to="/" replace />
            } 
          />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  )
}

function App() {
  return (
    <AppContent />
  )
}

export default App
