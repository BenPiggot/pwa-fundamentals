import { precacheStaticAssets, removeUnusedCaches, ALL_CACHES_LIST, ALL_CACHES } from './sw/caches';

const FALLBACK_IMAGE_URL = 'https://localhost:3100/images/fallback-grocery.png';
const fallbackImages = 'fallback-images';


self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(fallbackImages).then(cache => {
        return cache.add(FALLBACK_IMAGE_URL)
      }),
      precacheStaticAssets()
    ])
  )
}); 

self.addEventListener('activate', event => {
  event.waitUntil(
    removeUnusedCaches(ALL_CACHES_LIST)
  )
});

function fetchImageOrFallback(fetchEvent) {
  return fetch(fetchEvent.request.url, {
    mode: 'cors'
  }).then((response) => {
    if (!response.ok) {
      return caches.match(FALLBACK_IMAGE_URL, { cacheName: ALL_CACHES.fallbackImages });
    }
    else {
      return response;
    }
  }).catch(() => {
    return caches.match(FALLBACK_IMAGE_URL, { cacheName: ALL_CACHES.fallbackImages });
  })
}

self.addEventListener('fetch', event => {
  let acceptHeader = event.request.headers.get('accept');
  let requestUrl = new URL(event.request.url);
  let isGroceryImage = acceptHeader.indexOf('image/*') >= 0 && requestUrl.pathname.indexOf('/images/') === 0;

  event.respondWith(
    caches.match(event.request, { cacheName: ALL_CACHES.prefetch })
      .then(response => {
        // if a precached asset is found, return it
        if (response) return response; 
        // otherwise, let's dig deeper
        if (acceptHeader && isGroceryImage) {
          return fetchImageOrFallback(event)
        } else {
          return fetch(event.request)
        }
      })
  )
}); 