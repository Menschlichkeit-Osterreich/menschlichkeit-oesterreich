import { useEffect } from 'react';

/**
 * Service Worker Registration für PWA-Funktionalität
 * Registriert den Service Worker und handhabt Updates
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then(registration => {
            console.log('✅ Service Worker registriert:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Neue Version verfügbar
                    if (confirm('Eine neue Version ist verfügbar! Jetzt aktualisieren?')) {
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                      window.location.reload();
                    }
                  }
                });
              }
            });
          })
          .catch(error => {
            console.error('❌ Service Worker Registration fehlgeschlagen:', error);
          });
      });
    }
  }, []);

  return null;
}

export default ServiceWorkerRegistration;