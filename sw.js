const CACHE_NAME = 'routine-palette-v1.1';
const ASSETS = [
    './',
    './index.html',
    './style.css?v=1.1',
    './main.js?v=1.1',
    './manifest.json'
];

// 설치 시 리소스 캐싱
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// 리소스 호출 시 캐시 활용
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
