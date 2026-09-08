// ========================================
// DONAC
// PWA registration
// ========================================

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register(
                    "./service-worker.js"
                )

                .then(registration => {

                    console.log(
                        "DONAC Service Worker registered:",
                        registration.scope
                    );

                })

                .catch(error => {

                    console.error(
                        "DONAC Service Worker failed:",
                        error
                    );

                });

        }
    );

}