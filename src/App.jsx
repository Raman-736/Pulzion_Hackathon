import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ArticleList from './components/ArticleList';
import NewsVisual from './components/NewsVisual';

// -------------------------------------------------------------------
// ⚠️ IMPORTANT: Get your own API key from https://newsapi.org/
// Replace "YOUR_API_KEY_HERE" with your actual key.
// -------------------------------------------------------------------
const API_KEY = '6110ac83cbc44aa99a2e90d7ecdd586e';
const CATEGORIES = ['general', 'business', 'technology', 'science', 'sports'];

function App() {
  const [articles, setArticles] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [category, setCategory] = useState('general');
  const [view, setView] = useState('news'); // 'news' or 'bookmarks'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect 1: Load bookmarks from localStorage on initial app load
  useEffect(() => {
    const storedBookmarks = localStorage.getItem('newspulse-bookmarks');
    if (storedBookmarks) {
      setBookmarks(JSON.parse(storedBookmarks));
    }
  }, []);

  // Effect 2: Fetch news whenever the 'category' state changes
  useEffect(() => {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
      setError('Please add your NewsAPI.org API key to App.jsx');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data.status === 'error') {
          throw new Error(data.message);
        }
        setArticles(data.articles);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category]);

  // Handler: Add or remove a bookmark
  const handleBookmark = (articleToToggle) => {
    let newBookmarks;
    // Check if the article is already bookmarked
    const isBookmarked = bookmarks.some(
      (b) => b.url === articleToToggle.url
    );

    if (isBookmarked) {
      // Remove it
      newBookmarks = bookmarks.filter(
        (b) => b.url !== articleToToggle.url
      );
    } else {
      // Add it
      newBookmarks = [...bookmarks, articleToToggle];
    }

    setBookmarks(newBookmarks);
    // Update localStorage
    localStorage.setItem(
      'newspulse-bookmarks',
      JSON.stringify(newBookmarks)
    );
  };

  // Handler: Change the current category
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setView('news'); // Switch back to news view when a category is clicked
  };

  return (
    <div className="App">
      <Header view={view} setView={setView} />
      
      <nav className="category-selector">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={category === cat && view === 'news' ? 'active' : ''}
            onClick={() => handleCategoryChange(cat)}
          >
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
                  <ArticleList
                    articles={articles}
                    bookmarks={bookmarks}
                    onBookmark={handleBookmark}
                  />
                </div>
                <div className="visuals-wrapper">
                  <h2>Trending Terms</h2>
                  <NewsVisual articles={articles} />
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
              <ArticleList
                articles={bookmarks}
                bookmarks={bookmarks}
                onBookmark={handleBookmark}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;