import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Lets CSS pause decorative animations while the tab is in the background.
const syncHidden = () => document.documentElement.classList.toggle('tab-hidden', document.hidden);
document.addEventListener('visibilitychange', syncHidden);
syncHidden();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
