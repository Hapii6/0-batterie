// Simple offline cache so the app is considered installable
const CACHE = 'batterie-v1';
const ASSETS = [
'./',
'./index.html',
'./manifest.webmanifest'
// add: './icons/icon-192.png', './icons/icon-512.png' once present
];
self.addEventListener('install', (e)=>{
e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate', (e)=>{
e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch', (e)=>{
const req = e.request;
// cache-first for same-origin GET
if(req.method==='GET' && (new URL(req.url)).origin===location.origin){
e.respondWith(
caches.match(req).then(res=> res || fetch(req).then(net=>{
// optional: cache freshly fetched HTML/CSS/JS
const copy = net.clone();
if(copy.ok){ caches.open(CACHE).then(c=>c.put(req, copy)); }
return net;
}).catch(()=> caches.match('./index.html')))
);
}
});