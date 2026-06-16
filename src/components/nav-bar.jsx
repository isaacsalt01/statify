import React from "react"
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import {
  createDemoDataModule,
  createDemoSnapshot,
  downloadDemoDataModule
} from '../utils/demoSnapshot'

const NavBar = () => {
  const { accessToken, isDemoMode, logout } = useStore()
  const navigate = useNavigate()
  const hasActiveSession = accessToken || isDemoMode
  const showDemoCapture = import.meta.env.VITE_ENABLE_DEMO_CAPTURE === 'true'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleCaptureDemoData = async () => {
    const state = useStore.getState()
    const snapshot = createDemoSnapshot(state)
    const moduleContents = createDemoDataModule(snapshot)

    try {
      await navigator.clipboard.writeText(moduleContents)
      window.alert('Demo dataset copied. Replace src/data/demoData.js with the copied contents.')
    } catch (error) {
      console.error('Failed to copy demo dataset:', error)
      downloadDemoDataModule(moduleContents)
    }
  }

  return (
    <div className="navbar navbar-expand navbar-dark bg-dark">
      <div className="container">
        <span className="navbar-brand">Statify</span>
        <div className="collapse navbar-collapse" id="navbarColor02">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                {hasActiveSession ? 'Home' : 'Demo'}
              </Link>
            </li>
            {hasActiveSession && (
              <>
                <li className="nav-item">
                  <Link to="/audio-features" className="nav-link">
                    Audio Features
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/about" className="nav-link">
                    About
                  </Link>
                </li>
              </>
            )}
          </ul>
          {hasActiveSession && (
            <ul className="navbar-nav ms-auto">
              {showDemoCapture && accessToken && (
                <li className="nav-item" style={{ marginRight: "8px" }}>
                  <button
                    type="button"
                    className="btn btn-outline-info btn-sm"
                    onClick={handleCaptureDemoData}
                  >
                    Capture Demo Data
                  </button>
                </li>
              )}
              <li className="nav-item">
                <button 
                  type="button" 
                  className="btn btn-outline-danger btn-sm" 
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default NavBar
