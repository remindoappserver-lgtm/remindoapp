/* =====================================================
   REMINDO v1.7
   SERVICE WORKER
   Never Miss What Matters.
===================================================== */

const CACHE_NAME = "remindo-v1.7";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "./favicon.png"
];


/* =====================================================
   INSTALL
===================================================== */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(
                    FILES_TO_CACHE
                );

            })

    );

    self.skipWaiting();

});


/* =====================================================
   ACTIVATE
===================================================== */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames.map(cache => {

                        if (
                            cache !== CACHE_NAME
                        ) {

                            return caches.delete(
                                cache
                            );

                        }

                    })

                );

            })

            .then(() => {

                return self.clients.claim();

            })

    );

});


/* =====================================================
   FETCH
   NETWORK FIRST
===================================================== */

self.addEventListener("fetch", event => {

    if (
        event.request.method !== "GET"
    ) {

        return;

    }


    event.respondWith(

        fetch(event.request)

            .then(response => {

                if (
                    response &&
                    response.status === 200
                ) {

                    const responseClone =
                        response.clone();


                    caches.open(CACHE_NAME)
                        .then(cache => {

                            cache.put(
                                event.request,
                                responseClone
                            );

                        });

                }


                return response;

            })

            .catch(() => {

                return caches.match(
                    event.request
                );

            })

    );

});


/* =====================================================
   PUSH NOTIFICATIONS
===================================================== */

self.addEventListener(
    "push",
    event => {

        let data = {

            title:
                "Remindo Reminder",

            message:
                "You have an upcoming reminder."

        };


        if (event.data) {

            try {

                data =
                    event.data.json();

            }

            catch (error) {

                console.log(
                    "Push data error:",
                    error
                );

            }

        }


        const options = {

            body:
                data.message,

            icon:
                "./icon-512.png",

            badge:
                "./icon-192.png",

            vibrate: [
                200,
                100,
                200
            ],

            data: {

                url:
                    "./index.html"

            }

        };


        event.waitUntil(

            self.registration.showNotification(

                data.title,

                options

            )

        );

    }
);


/* =====================================================
   NOTIFICATION CLICK
===================================================== */

self.addEventListener(
    "notificationclick",
    event => {

        event.notification.close();


        event.waitUntil(

            clients.matchAll({

                type:
                    "window",

                includeUncontrolled:
                    true

            })

            .then(
                windowClients => {

                    for (
                        const client
                        of windowClients
                    ) {

                        if (
                            "focus"
                            in client
                        ) {

                            return client.focus();

                        }

                    }


                    if (
                        clients.openWindow
                    ) {

                        return clients.openWindow(
                            "./index.html"
                        );

                    }

                }

            )

        );

    }
);


/* =====================================================
   REMINDO SERVICE WORKER COMPLETE
===================================================== */
