// src/utils/antiCache.jsx
export const addCacheBuster = (url) => {
  const separator = url.includes('?') ? '&' : '?';
  const timestamp = new Date().getTime();
  return `${url}${separator}_t=${timestamp}`;
};

export const clearAppCache = async () => {
  try {
    // Clear service worker cache if it exists
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
      }
    }

    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }

    // Force reload from server
    window.location.reload(true);
  } catch (error) {
    console.error('Error clearing cache:', error);
    // Fallback: just reload
    window.location.reload();
  }
};

export const forceDataRefresh = () => {
  // Clear localStorage items related to the app
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('inventory') || key.startsWith('pizza'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Clear sessionStorage
  sessionStorage.clear();
};