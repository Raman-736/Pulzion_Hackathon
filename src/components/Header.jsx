import React from 'react';

function Header({ view, setView }) {
  return (
    <header className="app-header">
      <h1>NewsPulse 📈</h1>
      <button 
        className="bookmarks-btn" 
        onClick={() => setView(view === 'news' ? 'bookmarks' : 'news')}
      >
        {view === 'news' ? 'My Bookmarks' : 'Back to News'}
      </button>
    </header>
  );
}

export default Header;