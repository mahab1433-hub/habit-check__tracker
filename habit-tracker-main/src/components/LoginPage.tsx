import React, { useState } from 'react';
import './LoginPage.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { login: authLogin } = useAuth();
  const [username, setUsername] = useState(''); // This is email in our backend
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (isSignUp && !name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      let userData;
      if (isSignUp) {
        userData = await api.register(name, username, password);
      } else {
        userData = await api.login(username, password);
      }

      authLogin(userData);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setUsername('');
    setPassword('');
    setName('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="login-subtitle">{isSignUp ? 'Sign up to get started' : 'Sign in to continue'}</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {isSignUp && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <input
                  id="name"
                  type="text"
                  className="login-input"
                  value={name}
                  disabled={loading}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your full name"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="username">Email</label>
            <div className="input-wrapper">
              <input
                id="username"
                type="email"
                className="login-input"
                value={username}
                disabled={loading}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                value={password}
                disabled={loading}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>

          <div className="auth-toggle-container">
            <span className="auth-toggle-text">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </span>
            <button type="button" className="auth-toggle-link" onClick={toggleMode} disabled={loading}>
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
