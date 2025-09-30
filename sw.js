// Simple offline cache so the app is considered installable
const CACHE = 'batterie-v3';
const ASSETS = [
'/',
'/index.html',
'/manifest.webmanifest'
];


self.addEventListener('install', (e)=>{
self.skipWaiting();
e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});


self.addEventListener('activate', (e)=>{
e.waitUntil((async()=>{
const keys = await caches.keys();
await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
await self.clients.claim();
})());
});


self.addEventListener('fetch', (e)=>{
const req = e.request;
if(req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;


if(req.mode === 'navigate'){
e.respondWith((async()=>{
try{
const net = await fetch(req);
const copy = net.clone();
if(copy.ok) caches.open(CACHE).then(c=>c.put(req, copy));
return net;
}catch{
return (await caches.match(req)) || (await caches.match('/index.html'));
}
})());
return;
}


e.respondWith((async()=>{
const cached = await caches.match(req);
if(cached) return cached;
try{
const net = await fetch(req);
const copy = net.clone();
if(copy.ok) caches.open(CACHE).then(c=>c.put(req, copy));
return net;
}catch{
return caches.match('/index.html');
}
})());
});
