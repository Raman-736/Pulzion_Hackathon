import React from 'react';

// Receive token and the new handlers
function Header({ view, setView, token, onShowAuth, onLogout }) {
  return (
    <header className="app-header">
      <h1>NewsPulse 📈</h1>
      <div className="header-actions">
        {token && ( // Only show bookmarks if user is logged in
          <button
            className="bookmarks-btn"
            onClick={() => setView(view === 'news' ? 'bookmarks' : 'news')}
          >
            {view === 'news' ? 'My Bookmarks' : 'Back to News'}
          </button>
        )}
        {token ? (
          <button className="auth-btn" onClick={onLogout}>
            Sign Out
          </button>
        ) : (
          <button className="auth-btn" onClick={onShowAuth}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;