import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoFlash, IoLogIn, IoPersonAdd } from 'react-icons/io5'
import { login } from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login(email, password)
      localStorage.setItem('token', res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const autoFill = () => {
    setEmail('admin@smarthome.com')
    setPassword('admin123')
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <IoFlash className="login-logo" />
          <h1>AI Smart Home</h1>
          <h2>Energy Optimizer</h2>
          <p>Intelligent energy management powered by AI</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            <IoLogIn /> {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <button type="button" className="btn btn-autofill" onClick={autoFill}>
            <IoPersonAdd /> Auto-Fill Demo Credentials
          </button>
        </form>

        <div className="login-footer">
          <p>Smart Home Energy Optimizer v1.0</p>
        </div>
      </div>
    </div>
  )
}
