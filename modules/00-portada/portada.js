(() => {
    const splash = document.querySelector(".splash-screen");

    // Si la portada no existe, continuar al inicio de sesión.
    if (!splash) {
        window.location.replace("../01-login/index.html");
        return;
    }

    // Mostrar la animación y después abrir el inicio de sesión.
    window.setTimeout(() => {
        splash.classList.add("is-leaving");

        window.setTimeout(() => {
            window.location.replace("../01-login/index.html");
        }, 800);

    }, 4200);
})();
