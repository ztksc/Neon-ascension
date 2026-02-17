self.addEventListener("install",e=>{
e.waitUntil(
caches.open("neon").then(cache=>{
return cache.addAll(["/","index.html","style.css","game.js"]);
})
);
});

self.addEventListener("fetch",e=>{
e.respondWith(
caches.match(e.request).then(res=>{
return res||fetch(e.request);
})
);
});
