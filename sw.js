const CACHE_NAME = 'metro-explorer-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './data.js',
  './db.js',
  './app.js',
  './manifest.json',
  './icon.svg'
];

// 安装：缓存所有静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// 请求拦截：离线优先策略
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      // 有缓存则返回缓存，同时后台更新
      const fetchPromise = fetch(event.request).then(response => {
        // 只缓存同源请求
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // 网络失败，返回缓存首页
        return caches.match('./index.html');
      });

      return cached || fetchPromise;
    })
  );
});
