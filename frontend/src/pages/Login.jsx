import { useRef as useDemoLoginRef, useState as useDemoLoginState } from 'react';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoFlash, IoLogIn, IoPersonAdd } from 'react-icons/io5'
import { login } from '../services/api'
import { demoCredentials } from '../config/demoCredentials'

export default function Login() {
  const demoLoginLock = useDemoLoginRef(false);
  const [demoLoginBusy, setDemoLoginBusy] = useDemoLoginState(false);

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e, demoLoginCredentials) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login((demoLoginCredentials?.email ?? email), (demoLoginCredentials?.password ?? password))
      localStorage.setItem('token', res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const autoFill = () => {
    if (!demoCredentials.available) {
      setError('Demo credentials are not configured for this local environment.')
      return
    }
    setError('')
    setEmail(demoCredentials.email)
    setPassword(demoCredentials.password)
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

          <button
            type="button"
            className="btn btn-autofill"
            onClick={async (event) => {
 if (demoLoginLock.current) return;
 demoLoginLock.current = true; setDemoLoginBusy(true);
 const values = {};
 const captureDemoValue = (key, value) => { values[key] = value; return value; };
 try {
  await (async () => {
    if (!demoCredentials.available) {
      setError(captureDemoValue("error", 'Demo credentials are not configured for this local environment.'))
      return
    }
    setError(captureDemoValue("error", ''))
    setEmail(captureDemoValue("email", demoCredentials.email))
    setPassword(captureDemoValue("password", demoCredentials.password))
  })(event);
  if (values.error || typeof values.email !== 'string' || !values.email || typeof values.password !== 'string' || !values.password) { setError(typeof values.error === 'string' ? values.error : 'Demo credentials are unavailable.'); return; }
  await handleLogin(event, { email: values.email, password: values.password });
 } finally { demoLoginLock.current = false; setDemoLoginBusy(false); }
}}
            disabled={demoLoginBusy || (!demoCredentials.available || loading)}
            title={demoCredentials.available ? 'Log in with the configured local demo account' : demoCredentials.reason}
          >
            <IoPersonAdd /> Log In as Demo
          </button>
          {!demoCredentials.available && (
            <p className="demo-credentials-help">
              Demo login is unavailable because frontend demo credentials are not configured. Configure the local frontend environment for an existing demo account.
            </p>
          )}
        </form>

        <div className="login-footer">
          <p>Smart Home Energy Optimizer v1.0</p>
        </div>
      </div>
    </div>
  )
}
