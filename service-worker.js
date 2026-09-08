const CACHE_NAME = "donac-cache-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./cocktail.html",
    "./search.html",
    "./my-bar.html",

    "./css/style.css",
    "./css/components.css",

    "./css/pages/home.css",
    "./css/pages/cocktail.css",
    "./css/pages/search.css",
    "./css/pages/my-bar.css",

    "./js/app.js",
    "./js/cocktails.js",
    "./js/search.js",
    "./js/favorites.js",
    "./js/my-bar.js",

    "./data/cocktails.json",

    "./manifest.json",

    "./images/icons/icon-192.png",
    "./images/icons/icon-512.png"
];


// ========================================
// INSTALL
// ========================================

self.addEventListener("install", event => {

    event.waitUntil(

        caches
            .open(CACHE_NAME)

            .then(cache => {

                return cache.addAll(
                    APP_FILES
                );

            })

    );

});


// ========================================
// ACTIVATE
// ========================================

self.addEventListener("activate", event => {

    event.waitUntil(

        caches
            .keys()

            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(
                            cacheName =>
                                cacheName !==
                                CACHE_NAME
                        )

                        .map(
                            cacheName =>
                                caches.delete(
                                    cacheName
                                )
                        )

                );

            })

    );

});


// ========================================
// FETCH
// ========================================

self.addEventListener("fetch", event => {

    event.respondWith(

        caches
            .match(event.request)

            .then(cachedResponse => {

                if (cachedResponse) {

                    return cachedResponse;

                }

                return fetch(
                    event.request
                );

            })

    );

});