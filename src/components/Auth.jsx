import React, { useState } from 'react';

function Auth({ onLogin, onRegister, onClose }) {
  // State to toggle between Login and Register modes
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoginMode) {
      onLogin(email, password);
    } else {
      onRegister(email, password);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>{isLoginMode ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            {isLoginMode ? 'Login' : 'Create Account'}
          </button>
        </form>
        <p className="toggle-mode">
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLoginMode(!isLoginMode)}>
            {isLoginMode ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;