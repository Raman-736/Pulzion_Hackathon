import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ArticleList from './components/ArticleList';
import NewsVisual from './components/NewsVisual';
import Auth from './components/Auth';
import SourcePieChart from './components/SourcePieChart';

const API_KEY = '6110ac83cbc44aa99a2e90d7ecdd586e'; // Or use import.meta.env.VITE_NEWS_API_KEY
const CATEGORIES = ['general', 'business', 'technology', 'science', 'sports'];
const API_BASE_URL = 'http://localhost:5000'; // Your backend server URL

function App() {
  // --- State Management ---
  const [articles, setArticles] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [category, setCategory] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [country, setCountry] = useState('us');
  const [view, setView] = useState('news');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for authentication
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showAuth, setShowAuth] = useState(false);

  // --- Effect for Fetching News ---
  useEffect(() => {
    if (API_KEY === 'YOUR_API_KEY_HERE' || !API_KEY) {
      setError('Please add your NewsAPI.org API key.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    let url;
    if (searchTerm) {
      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchTerm)}&sortBy=publishedAt&apiKey=${API_KEY}`;
    } else {
      url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${API_KEY}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'error') throw new Error(data.message);
        setArticles(data.articles);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [category, country, searchTerm]);

  // --- Effect for Fetching Bookmarks on Login ---
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/bookmarks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Could not fetch bookmarks.');
        const data = await response.json();
        setBookmarks(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBookmarks();
  }, [token]);

  // --- Authentication Handlers ---
  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setShowAuth(false);
      } else {
        alert(data.error || "Login failed!");
      }
    } catch (err) {
      alert("An error occurred. Please try again.");
    }
  };

  const handleRegister = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Registration successful! Please log in.");
        setShowAuth(false);
      } else {
        alert(data.error || "Registration failed!");
      }
    } catch (err) {
      alert("An error occurred. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setBookmarks([]);
  };

  // --- Bookmark Handler (API Version) ---
  const handleBookmark = async (articleToToggle) => {
    if (!token) {
      setShowAuth(true); // Open login modal if not logged in
      return;
    }

    const isBookmarked = bookmarks.some(b => b.url === articleToToggle.url);
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    try {
      if (isBookmarked) {
        await fetch(`${API_BASE_URL}/api/bookmarks`, {
          method: 'DELETE',
          headers,
          body: JSON.stringify({ articleUrl: articleToToggle.url }),
        });
        setBookmarks(bookmarks.filter(b => b.url !== articleToToggle.url));
      } else {
        await fetch(`${API_BASE_URL}/api/bookmarks`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            url: articleToToggle.url,
            title: articleToToggle.title,
            description: articleToToggle.description,
            urlToImage: articleToToggle.urlToImage,
            sourceName: articleToToggle.source.name,
          }),
        });
        // Optimistically update UI
        setBookmarks([...bookmarks, articleToToggle]);
      }
    } catch (err) {
      console.error("Failed to update bookmark:", err);
    }
  };

  // --- UI Handlers ---
  const handleCategoryChange = (newCategory) => {
    setSearchTerm('');
    setCategory(newCategory);
    setView('news');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newSearchTerm = e.target.elements.search.value;
    if (newSearchTerm) {
      setSearchTerm(newSearchTerm);
      setCategory('');
    }
  };

  return (
    <div className="App">
      {showAuth && (
        <Auth
          onLogin={handleLogin}
          onRegister={handleRegister}
          onClose={() => setShowAuth(false)}
        />
      )}

      <Header
        view={view}
        setView={setView}
        token={token}
        onShowAuth={() => setShowAuth(true)}
        onLogout={handleLogout}
      />

      <div className="filters-container">
        <form className="search-form" onSubmit={handleSearch}>
          <input type="text" name="search" placeholder="Search for any topic..." />
          <button type="submit">Search</button>
        </form>
        <div className="country-selector">
          <label htmlFor="country">Country: </label>
          <select id="country" value={country} onChange={(e) => setCountry(e.target.value)} disabled={!!searchTerm}>
            <option value="us">United States</option>
            <option value="in">India</option>
            <option value="gb">United Kingdom</option>
            <option value="de">Germany</option>
            <option value="jp">Japan</option>
            <option value="au">Australia</option>
          </select>
        </div>
      </div>

      <nav className="category-selector">
        {CATEGORIES.map((cat) => (
          <button key={cat} className={category === cat && !searchTerm && view === 'news' ? 'active' : ''} onClick={() => handleCategoryChange(cat)}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </nav>

      <main>
        {view === 'news' && (
          <>
            {loading && <p className="status-message">Loading articles...</p>}
            {error && <p className="status-message error">Error: {error}</p>}
            {!loading && !error && (
              <div className="content-container">
                <div className="article-list-wrapper">
                  <ArticleList articles={articles} bookmarks={bookmarks} onBookmark={handleBookmark} />
                </div>
                <div className="visuals-wrapper">
                  <div className="visual-box">
                    <h2>Trending Terms</h2>
                    <NewsVisual articles={articles} />
                  </div>
                  <div className="visual-box">
                    <h2>Source Distribution</h2>
                    <SourcePieChart articles={articles} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {view === 'bookmarks' && (
          <div className="bookmarks-container">
            <h2>My Bookmarks</h2>
            {bookmarks.length === 0 ? (
              <p className="status-message">You have no saved articles.</p>
            ) : (
              <ArticleList articles={bookmarks} bookmarks={bookmarks} onBookmark={handleBookmark} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;