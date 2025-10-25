import React from 'react';
import ArticleCard from './ArticleCard';

function ArticleList({ articles, bookmarks, onBookmark }) {
  // Check if the list of articles is valid
  if (!articles || articles.length === 0) {
    return <p className="status-message">No articles found.</p>;
  }

  return (
    <div className="article-list">
      {articles.map((article, index) => {
        // Check if this specific article is in the bookmarks list
        const isBookmarked = bookmarks.some((b) => b.url === article.url);
        
        return (
          <ArticleCard
            key={article.url || index} // Use URL as key
            article={article}
            onBookmark={onBookmark}
            isBookmarked={isBookmarked}
          />
        );
      })}
    </div>
  );
}

export default ArticleList;