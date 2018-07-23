const FALLBACK_IMAGE_URL = 'https://localhost:3100/images/fallback-grocery.png';
const fallbackImages = 'fallback-images';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(fallbackImages).then(cache => {
      return cache.add(FALLBACK_IMAGE_URL)
    })
  )
});

self.addEventListener('activate', event => {
  caches.keys().then(cacheNames => {
    
  })
});

function fetchImageOrFallback(fetchEvent) {
  console.log(fetchEvent)
  return fetch(fetchEvent.request.url, {
    mode: 'cors'
  }).then((response) => {
    if (!response.ok) {
      return caches.match(FALLBACK_IMAGE_URL, { cacheName: fallbackImages });
    }
    else {
      return response;
    }
  }).catch(() => {
    return caches.match(FALLBACK_IMAGE_URL, { cacheName: fallbackImages });
  })
}

self.addEventListener('fetch', event => {
  let acceptHeader = event.request.headers.get('accept');
  let requestUrl = new URL(event.request.url);
  let isGroceryImage = acceptHeader.indexOf('image/*') >= 0 && requestUrl.pathname.indexOf('/images/') === 0;

  if (acceptHeader && isGroceryImage) {
    console.log('image fetch')
    event.respondWith(
      fetchImageOrFallback(event)
    );
  }
}); 