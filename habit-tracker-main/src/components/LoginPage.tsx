import React, { useState } from 'react';
import './LoginPage.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState(''); // New state for Name
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (isSignUp && !name.trim()) {
      setError('Please enter your name');
      return;
    }

    // "Login" successful (Mock)
    localStorage.setItem('auth_user', 'true');
    localStorage.setItem('auth_user_email', username); // Save email/username
    // Save name if signing up, otherwise default to "User" if not set previously
    if (isSignUp) {
      localStorage.setItem('auth_user_name', name);
    } else if (!localStorage.getItem('auth_user_name')) {
      localStorage.setItem('auth_user_name', 'User');
    }

    onLogin();
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
          {/* Name Field - Only for Sign Up */}
          {isSignUp && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <input
                  id="name"
                  type="text"
                  className="login-input"
                  value={name}
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
            <label className="form-label" htmlFor="username">Email or Username</label>
            <div className="input-wrapper">
              <input
                id="username"
                type="text"
                className="login-input"
                value={username}
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

          <div className="error-message">
            {error}
          </div>

          <button type="submit" className="login-button">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>

          <div className="auth-toggle-container">
            <span className="auth-toggle-text">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </span>
            <button type="button" className="auth-toggle-link" onClick={toggleMode}>
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
