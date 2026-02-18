/**
 * Piano Tuner Pro - Main Entry Point
 * Progressive Web App for professional piano tuning
 */

import './ui/styles.css';
import { AudioEngine } from './audio/audioEngine.js';
import { DataManager } from './data/dataManager.js';
import { App } from './ui/app.js';

// Register service worker for offline capability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('ServiceWorker registered:', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize data manager
    const dataManager = new DataManager();
    await dataManager.init();
    
    // Initialize audio engine
    const audioEngine = new AudioEngine();
    
    // Initialize UI
    const app = new App(audioEngine, dataManager);
    await app.init();
    
    // Handle install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      app.showInstallButton(deferredPrompt);
    });
    
    // Hide splash screen
    const loading = document.querySelector('.loading');
    if (loading) {
      loading.style.opacity = '0';
      setTimeout(() => loading.remove(), 300);
    }
    
  } catch (error) {
    console.error('Failed to initialize app:', error);
    showError('Erreur d\'initialisation de l\'application');
  }
});

function showError(message) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 2rem;">
      <div style="font-size: 48px; margin-bottom: 1rem;">⚠️</div>
      <div style="font-size: 18px; color: #ff6b6b; text-align: center;">${message}</div>
      <button onclick="location.reload()" style="margin-top: 2rem; padding: 1rem 2rem; font-size: 16px; background: #00d4ff; border: none; border-radius: 8px; color: #0f0f1e; cursor: pointer;">
        Réessayer
      </button>
    </div>
  `;
}

// Prevent zoom on mobile
document.addEventListener('gesturestart', function (e) {
  e.preventDefault();
});

// Lock orientation to portrait on mobile
if (screen.orientation && screen.orientation.lock) {
  screen.orientation.lock('portrait').catch(() => {
    // Silently fail if lock not supported
  });
}
