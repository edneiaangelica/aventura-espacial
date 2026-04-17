const CACHE_NAME = "aventura-espacial-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/images/tela-inicial.png",
  "./assets/images/narrativa-1.png",
  "./assets/images/narrativa-2.png",
  "./assets/images/narrativa-3.png",
  "./assets/images/narrativa-4.png",
  "./assets/images/narrativa-5.png",
  "./assets/images/narrativa-6.png",
  "./assets/images/narrativa-7.png",
  "./assets/images/nivel1-vitoria.png",
  "./assets/images/nivel1-derrota.png",
  "./assets/images/nivel2-vitoria.png",
  "./assets/images/nivel2-derrota.png",
  "./assets/images/nivel3-vitoria.png",
  "./assets/images/nivel3-derrota.png",
  "./assets/images/vitoria-final.png",
  "./assets/images/derrota-final.png",
  "./assets/images/acerto.png",
  "./assets/images/erro.png",
  "./assets/images/pistas.png",
  "./assets/sounds/musica.mp3",
  "./assets/sounds/tic-tac.mp3",
  "./assets/sounds/acerto.mp3",
  "./assets/sounds/erro.mp3",
  "./assets/sounds/tempo-esgotado.mp3",
  "./assets/sounds/vitoria.mp3",
  "./assets/sounds/derrota.mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
