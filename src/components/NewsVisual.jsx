import React, { useMemo } from 'react';
import ReactWordcloud from 'react-wordcloud';

// List of common words to ignore in the word cloud
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'for', 'to', 'of', 'with', 'by', 'is', 'are', 
  'was', 'were', 'it', 'this', 'that', 'and', 'or', 'but', 'if', 'so', 'about', 
  'more', 'my', 'your', 'our', 'from', 'as', 'not', 'be', 'will', 'has', 'have',
  'who', 'what', 'when', 'where', 'why', 'how', 's', 't', 'https', 'www'
]);

// Function to process all article text into word-frequency data
function processText(articles) {
  const text = articles
    .map((a) => a.title + ' ' + (a.description || ''))
    .join(' ');

  const wordCounts = {};
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/); // Split by spaces

  for (const word of words) {
    if (word.length > 3 && !STOP_WORDS.has(word) && !/^\d+$/.test(word)) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  }

  // Format for react-wordcloud: { text: 'word', value: 64 }
  return Object.entries(wordCounts)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value) // Sort descending
    .slice(0, 100); // Take top 100 words
}

function NewsVisual({ articles }) {
  // useMemo ensures this expensive text processing only runs
  // when the 'articles' prop actually changes.
  const words = useMemo(() => processText(articles), [articles]);

  const options = {
    fontSizes: [12, 60],
    rotationAngles: [0, 0], // Keep words horizontal
    padding: 1,
  };

  if (words.length === 0) {
    return <p>Not enough text to generate a word cloud.</p>;
  }

  return (
    <div className="wordcloud-container">
      <ReactWordcloud words={words} options={options} />
    </div>
  );
}

export default NewsVisual;