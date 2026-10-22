(() => {
    const splash = document.querySelector(".splash-screen");

    if (!splash) {
        window.location.replace("../01-login/index.html");
        return;
    }

    // Esperar a que el logo termine su animación de entrada
    // y permanezca visible durante unos instantes.
    window.setTimeout(() => {
        splash.classList.add("is-leaving");

        // Redirigir cuando termine la transición de salida.
        window.setTimeout(() => {
            window.location.replace("../01-login/index.html");
        }, 850);

    }, 3000);
})();
