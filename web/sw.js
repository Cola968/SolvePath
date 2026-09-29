const CACHE='snapstudy-v12-3';
const SHELL=['/','/styles.css?v=1203','/app.js?v=1203','/manifest.webmanifest','/icon.svg'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).catch(()=>undefined));
});
self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin) return;
  if(url.pathname==='/app.js'||url.pathname==='/styles.css'||url.pathname==='/'||url.pathname==='/trophies'){
    event.respondWith(fetch(event.request).then(res=>{
      const copy=res.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return res;
    }).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('/'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(res=>{
    if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}
    return res;
  })));
});