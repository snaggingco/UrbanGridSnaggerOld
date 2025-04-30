// Service Worker for snagging.me
const CACHE_NAME = 'snagging-cache-v5'; // Incrementing cache version

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/favicon-192x192.png',
  '/manifest.json'
  // Removed potentially problematic assets:
  // '/src/critical.css',
  // '/internachi.webp',
  // '/internachi2.webp',
  // '/og-image.jpg'
];

// Install event - precache critical assets with better error handling
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        
        // More robust caching strategy - cache files individually
        // to prevent a single missing file from failing the entire cache
        return Promise.all(
          PRECACHE_ASSETS.map(url => {
            return cache.add(url).catch(error => {
              console.warn('Failed to cache: ' + url, error);
              // Continue despite failures for individual items
              return Promise.resolve();
            });
          })
        );
      })
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error('Service worker install failed:', error);
        // Skip waiting anyway to avoid hanging service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network-first strategy with fallback to cache
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip for browser-sync or socket requests
  if (event.request.url.includes('browser-sync') || 
      event.request.url.includes('socket.io') ||
      event.request.url.includes('hot-update')) {
    return;
  }

  // Network first strategy
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response for caching
        const responseClone = response.clone();
        
        if (response.status === 200) {
          caches.open(CACHE_NAME)
            .then(cache => {
              // Don't cache API responses
              if (!event.request.url.includes('/api/')) {
                cache.put(event.request, responseClone);
              }
            });
        }
        
        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // For navigation requests, serve the offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            // For image requests, you could return a placeholder
            if (event.request.destination === 'image') {
              return new Response(
                '<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
                '<rect width="100" height="100" fill="#f0f0f0"/>' +
                '<text x="50" y="50" font-family="sans-serif" font-size="12" text-anchor="middle" dominant-baseline="middle" fill="#888">Image</text>' +
                '</svg>',
                { 
                  headers: {'Content-Type': 'image/svg+xml'} 
                }
              );
            }
            
            // If nothing else matches
            return new Response('Content not available offline');
          });
      })
  );
});

// Background sync for form submissions when offline
self.addEventListener('sync', event => {
  if (event.tag === 'submit-form') {
    event.waitUntil(
      // Here you would:
      // 1. Get stored form submissions from IndexedDB
      // 2. Attempt to submit them
      // 3. Clear from IndexedDB if successful
      console.log('Background sync triggered for form submission')
    );
  }
});

// Push notification event
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New update from Snagging By UrbanGrid',
      icon: '/favicon-192x192.png',
      badge: '/favicon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Snagging By UrbanGrid', 
        options
      )
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});