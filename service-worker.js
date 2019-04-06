'use strict';

var cacheVersion = 1;
var currentCache = {
  offline: 'offline-cache' + cacheVersion
};
const offlineUrl = 'offline-page';

function createCacheBustedRequest(url) {
	let request = new Request(url, {cache: 'reload'});
	if ('cache' in request) {
		return request;
	}
	let bustedUrl = new URL(url, self.location.href);
	bustedUrl.search += (bustedUrl.search ? '&' : '') + 'cachebust=' + Date.now();
	return new Request(bustedUrl);
}

this.addEventListener('install', event => {
  event.waitUntil(
    caches.open(currentCache.offline).then(function(cache) {
      return cache.addAll([
		offlineUrl,
		'juego.js',
		'service-worker.js'
      ]);
    })
  );
});

this.addEventListener('fetch', event => {
	if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
		event.respondWith(
		  fetch(createCacheBustedRequest(event.request.url)).catch(error => {
			  return caches.match(offlineUrl);
		  })
		);
	} else {
        event.respondWith(caches.match(event.request).
			then(function (response) {
				return response || fetch(event.request);
			})
        );
    }
});
