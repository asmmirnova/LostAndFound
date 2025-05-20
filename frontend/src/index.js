import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Prevent extreme zoom out with keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Only prevent extreme zoom out (Ctrl + -)
  if ((e.ctrlKey || e.metaKey) && e.key === '-') {
    const currentScale = document.documentElement.style.zoom || 1;
    if (parseFloat(currentScale) <= 0.7) {
      e.preventDefault();
    }
  }
});

// Set initial scale
window.addEventListener('load', function() {
  // Set initial zoom to 1 if it's too small
  if (window.innerWidth / document.documentElement.clientWidth > 1.5) {
    document.body.style.zoom = 1;
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
