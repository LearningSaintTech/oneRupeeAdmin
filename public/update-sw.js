// Manual Service Worker Update Script
// Run this in browser console to force update the service worker

console.log('🔄 Starting manual service worker update...');

async function updateServiceWorker() {
  try {
    // 1. Unregister existing service worker
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      console.log('📝 Found existing service worker, unregistering...');
      await registration.unregister();
      console.log('✅ Service worker unregistered');
    }

    // 2. Clear all caches
    console.log('🗑️ Clearing all caches...');
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('✅ All caches cleared');

    // 3. Clear service worker cache
    if ('serviceWorker' in navigator) {
      console.log('🧹 Clearing service worker cache...');
      await navigator.serviceWorker.getRegistrations().then(registrations => {
        return Promise.all(registrations.map(registration => registration.unregister()));
      });
      console.log('✅ Service worker cache cleared');
    }

    // 4. Reload the page
    console.log('🔄 Reloading page to register new service worker...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);

  } catch (error) {
    console.error('❌ Error updating service worker:', error);
  }
}

// Run the update
updateServiceWorker();
