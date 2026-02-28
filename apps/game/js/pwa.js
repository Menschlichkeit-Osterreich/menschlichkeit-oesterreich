/* ==========================================================================
   Brücken Bauen - PWA Controller
   Progressive Web App functionality including Service Worker registration
   ========================================================================== */

/* global SCENARIOS, DEMOCRACY_PROFILES, gtag */

class PWAController {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.isOnline = navigator.onLine;

    this.init();
  }

  async init() {
    console.log('📱 PWA Controller initialized');

    // Check if already running as installed app
    this.checkInstallationStatus();

    // Register service worker
    await this.registerServiceWorker();

    // Setup installation prompt
    this.setupInstallPrompt();

    // Setup offline/online detection
    this.setupNetworkDetection();

    // Setup app update notifications
    this.setupUpdateNotifications();

    // Initialize offline functionality
    this.initializeOfflineFunctionality();
  }

  checkInstallationStatus() {
    // Check if running in standalone mode (installed)
    this.isInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (this.isInstalled) {
      console.log('✅ App is running in installed mode');
      document.body.classList.add('pwa-installed');
    }
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('./sw.js');
        console.log('✅ Service Worker registered:', registration);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateAvailable();
              }
            });
          }
        });

        return registration;
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    } else {
      console.warn('⚠️ Service Worker not supported');
    }
  }

  setupInstallPrompt() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', e => {
      console.log('📥 Install prompt available');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('✅ App was installed');
      this.hideInstallButton();
      this.isInstalled = true;
      document.body.classList.add('pwa-installed');
      this.trackPWAInstall();
    });
  }

  showInstallButton() {
    // Create install button if it doesn't exist
    let installButton = document.getElementById('pwa-install-btn');

    if (!installButton) {
      installButton = document.createElement('button');
      installButton.id = 'pwa-install-btn';
      installButton.className = 'cta-button secondary-button pwa-install-btn';
      installButton.innerHTML = `
        <svg class="button-icon" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M10 15l-5-5h3V2h4v8h3l-5 5zm7 2H3v2h14v-2z" fill="currentColor"/>
        </svg>
        App installieren
      `;
      installButton.setAttribute('aria-label', 'Installiere Brücken Bauen als App');

      // Add to appropriate locations
      const welcomeCard = document.querySelector('.welcome-card');
      if (welcomeCard) {
        const existingButton = welcomeCard.querySelector('.cta-button');
        if (existingButton) {
          existingButton.parentNode.insertBefore(installButton, existingButton.nextSibling);
        }
      }
    }

    installButton.style.display = 'inline-flex';
    installButton.addEventListener('click', () => this.promptInstall());
  }

  hideInstallButton() {
    const installButton = document.getElementById('pwa-install-btn');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  async promptInstall() {
    if (!this.deferredPrompt) return;

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('✅ User accepted install prompt');
      } else {
        console.log('❌ User dismissed install prompt');
      }

      this.deferredPrompt = null;
      this.hideInstallButton();
    } catch (error) {
      console.error('❌ Error during install prompt:', error);
    }
  }

  setupNetworkDetection() {
    // Update online status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOffline();
    });

    // Initial status
    if (!this.isOnline) {
      this.handleOffline();
    }
  }

  handleOnline() {
    console.log('🌐 Back online');
    document.body.classList.remove('offline');

    // Remove offline notification
    const offlineNotification = document.getElementById('offline-notification');
    if (offlineNotification) {
      offlineNotification.remove();
    }

    // Show online notification briefly
    this.showNotification('Verbindung wiederhergestellt', 'success', 3000);

    // Sync any pending data
    this.syncPendingData();
  }

  handleOffline() {
    console.log('📴 Gone offline');
    document.body.classList.add('offline');

    // Show persistent offline notification
    this.showOfflineNotification();
  }

  showOfflineNotification() {
    // Remove existing notification
    const existing = document.getElementById('offline-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.id = 'offline-notification';
    notification.className = 'offline-notification';
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
      <div class="notification-content">
        <svg class="notification-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" fill="currentColor"/>
          <path d="M23 12l-2 2-2-2 2-2 2 2z" fill="currentColor"/>
        </svg>
        <div>
          <strong>Offline-Modus</strong>
          <p>Das Spiel funktioniert auch ohne Internetverbindung.</p>
        </div>
      </div>
    `;

    document.body.appendChild(notification);
  }

  setupUpdateNotifications() {
    // Check for app updates periodically
    setInterval(() => {
      this.checkForUpdates();
    }, 30000); // Check every 30 seconds
  }

  async checkForUpdates() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.update();
      }
    }
  }

  showUpdateAvailable() {
    this.showNotification(
      'Eine neue Version ist verfügbar',
      'info',
      0, // Persistent
      [
        {
          text: 'Aktualisieren',
          action: () => this.applyUpdate(),
        },
        {
          text: 'Später',
          action: () => this.dismissUpdate(),
        },
      ]
    );
  }

  async applyUpdate() {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  dismissUpdate() {
    const updateNotification = document.querySelector('.notification[data-type="info"]');
    if (updateNotification) {
      updateNotification.remove();
    }
  }

  initializeOfflineFunctionality() {
    // Save game data to localStorage for offline play
    this.setupOfflineStorage();

    // Load offline content
    this.loadOfflineContent();
  }

  setupOfflineStorage() {
    // Save game scenarios for offline use
    if (typeof SCENARIOS !== 'undefined') {
      localStorage.setItem('democracy_game_scenarios', JSON.stringify(SCENARIOS));
      localStorage.setItem('democracy_game_profiles', JSON.stringify(DEMOCRACY_PROFILES));
      console.log('💾 Game data saved for offline use');
    }
  }

  loadOfflineContent() {
    // Load game data from localStorage if online version fails
    if (!this.isOnline || typeof SCENARIOS === 'undefined') {
      try {
        const savedScenarios = localStorage.getItem('democracy_game_scenarios');
        const savedProfiles = localStorage.getItem('democracy_game_profiles');

        if (savedScenarios && savedProfiles) {
          window.SCENARIOS = JSON.parse(savedScenarios);
          window.DEMOCRACY_PROFILES = JSON.parse(savedProfiles);
          console.log('📱 Offline content loaded');
        }
      } catch (error) {
        console.error('❌ Error loading offline content:', error);
      }
    }
  }

  saveGameProgress(gameData) {
    try {
      const progressData = {
        ...gameData,
        timestamp: new Date().toISOString(),
        version: '1.0',
      };

      localStorage.setItem('democracy_game_progress', JSON.stringify(progressData));
      console.log('💾 Game progress saved');
    } catch (error) {
      console.error('❌ Error saving game progress:', error);
    }
  }

  loadGameProgress() {
    try {
      const savedProgress = localStorage.getItem('democracy_game_progress');
      if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        console.log('📱 Game progress loaded');
        return progressData;
      }
    } catch (error) {
      console.error('❌ Error loading game progress:', error);
    }
    return null;
  }

  clearGameProgress() {
    try {
      localStorage.removeItem('democracy_game_progress');
      console.log('🗑️ Game progress cleared');
    } catch (error) {
      console.error('❌ Error clearing game progress:', error);
    }
  }

  async syncPendingData() {
    // Sync any game completion data when back online
    try {
      const pendingData = localStorage.getItem('democracy_game_pending_sync');
      if (pendingData) {
        const data = JSON.parse(pendingData);

        // Send analytics data if online
        if (typeof gtag === 'function' && data.analytics) {
          data.analytics.forEach(event => {
            gtag('event', event.name, event.parameters);
          });
        }

        // Clear pending data
        localStorage.removeItem('democracy_game_pending_sync');
        console.log('📤 Pending data synced');
      }
    } catch (error) {
      console.error('❌ Error syncing pending data:', error);
    }
  }

  // Utility notification system
  showNotification(message, type = 'info', duration = 5000, actions = []) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('data-type', type);
    notification.setAttribute('role', 'alert');

    const iconMap = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };

    let actionsHTML = '';
    if (actions.length > 0) {
      actionsHTML = `
        <div class="notification-actions">
          ${actions
            .map(
              action =>
                `<button type="button" class="notification-btn" data-action="${action.text}">${action.text}</button>`
            )
            .join('')}
        </div>
      `;
    }

    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon" aria-hidden="true">${iconMap[type] || iconMap.info}</span>
        <span class="notification-message">${message}</span>
      </div>
      ${actionsHTML}
    `;

    // Add event listeners for actions
    actions.forEach(action => {
      const button = notification.querySelector(`[data-action="${action.text}"]`);
      if (button) {
        button.addEventListener('click', () => {
          action.action();
          notification.remove();
        });
      }
    });

    document.body.appendChild(notification);

    // Auto-remove if duration is set
    if (duration > 0) {
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, duration);
    }

    return notification;
  }

  // Analytics tracking for PWA features
  trackPWAInstall() {
    if (typeof gtag === 'function') {
      gtag('event', 'pwa_install', {
        event_category: 'pwa',
        event_label: 'democracy_game',
      });
    }
  }

  trackOfflineUsage() {
    if (typeof gtag === 'function') {
      // Store for later sync if offline
      const analyticsEvent = {
        name: 'offline_usage',
        parameters: {
          event_category: 'pwa',
          event_label: 'democracy_game',
        },
      };

      if (this.isOnline) {
        gtag('event', analyticsEvent.name, analyticsEvent.parameters);
      } else {
        // Store for later sync
        const pending = JSON.parse(
          localStorage.getItem('democracy_game_pending_sync') || '{"analytics":[]}'
        );
        pending.analytics.push(analyticsEvent);
        localStorage.setItem('democracy_game_pending_sync', JSON.stringify(pending));
      }
    }
  }

  // Feature detection and fallbacks
  getCapabilities() {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      offline: 'onLine' in navigator,
      install: 'BeforeInstallPromptEvent' in window,
      notifications: 'Notification' in window,
      share: 'share' in navigator,
      clipboard: 'clipboard' in navigator,
      localStorage: 'localStorage' in window,
      indexedDB: 'indexedDB' in window,
    };
  }

  // Debug information
  getPWAInfo() {
    return {
      isInstalled: this.isInstalled,
      isOnline: this.isOnline,
      deferredPrompt: !!this.deferredPrompt,
      capabilities: this.getCapabilities(),
      storageUsage: this.getStorageUsage(),
    };
  }

  getStorageUsage() {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          total += localStorage[key].length;
        }
      }
      return `${Math.round(total / 1024)} KB`;
    } catch {
      return 'Unknown';
    }
  }
}

// Service Worker messaging
navigator.serviceWorker?.addEventListener('message', event => {
  if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
    // Handle update available message from service worker
    const pwa = window.pwaController;
    if (pwa) {
      pwa.showUpdateAvailable();
    }
  }
});

// Initialize PWA functionality
document.addEventListener('DOMContentLoaded', () => {
  window.pwaController = new PWAController();

  // Expose debug info in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.getPWAInfo = () => window.pwaController.getPWAInfo();
    console.log('🔧 PWA Debug: Use getPWAInfo() in console');
  }
});
