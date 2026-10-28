import React from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App';
import {registerServiceWorker} from './lib/pwa';
import './styles.css';
import './adaptation.css';
import './extra.css';

// Register PWA service worker in production builds only (after window load)
registerServiceWorker();

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
