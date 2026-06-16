import React from "react"
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

const LoginPage = ({ accessToken }) => {
  const navigate = useNavigate()
  const { loadDemoData } = useStore()
  const showSpotifyLogin = import.meta.env.VITE_ENABLE_SPOTIFY_LOGIN === 'true'

  const handleLogin = () => {

    const authUrl = import.meta.env.VITE_LOGIN_URL || "http://127.0.0.1:9000/.netlify/functions/api/login"
    window.location.href = authUrl
  }

  const handleDemo = () => {
    loadDemoData()
    navigate('/')
  }


  return (
    <div className="container" style={{paddingTop: "30px", textAlign: "left"}}>
      <h1 className="display-3">Welcome to Statify</h1>
      <p className="lead">Explore Spotify-style listening analytics with a public demo dataset.</p>
        <hr className="my-4" />
        <p>Demo mode shows the app's top tracks, artists, genre breakdowns, and embedded playback without requiring Spotify API access.</p>
        <p className="lead">
          <button
            className="btn btn-success btn-lg"
            onClick={handleDemo}
          >
            Try Demo
          </button>
          {showSpotifyLogin && !accessToken && (
            <button
              className="btn btn-outline-success btn-lg"
              onClick={handleLogin}
              style={{ marginLeft: "10px" }}
            >
              Login with Spotify
            </button>
          )}
          {accessToken && <span style={{ marginLeft: "10px" }}>Already logged in</span>}
      </p>
    </div>
  )
}

export default LoginPage
