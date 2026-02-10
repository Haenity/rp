const CACHE_NAME = 'routine-palette-v1.2';
const ASSETS = [
    './',
    './index.html',
    './style.css?v=1.2',
    './main.js?v=1.2',
    './manifest.json?v=1.2'
];

// 설치 시 리소스 캐싱
self.addEventListener('install', (event) => {
    self.skipWaiting(); // 새 서비스 워커가 즉시 활성화되도록 강제
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// 활성화 시 오래된 캐시 삭제
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
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
