import React from 'react';

function ArticleCard({ article, onBookmark, isBookmarked }) {
  const { title, description, url, urlToImage, source } = article;

  // Use a placeholder if no image is provided
  const imageUrl = urlToImage || 'https://via.placeholder.com/400x200?text=No+Image';

  return (
    <div className="article-card">
      <div className="card-image">
        <img src={imageUrl} alt={title} />
      </div>
      <div className="card-content">
        <span className="card-source">{source?.name || 'Unknown Source'}</span>
        <h3 className="card-title">
          <a href={url} target="_blank" rel="noopener noreferrer">
            {title}
          </a>
        </h3>
        <p className="card-description">{description}</p>
        <button 
          className={`card-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={() => onBookmark(article)}
        >
          {isBookmarked ? '★ Saved' : '☆ Save'}
        </button>
      </div>
    </div>
  );
}

export default ArticleCard;