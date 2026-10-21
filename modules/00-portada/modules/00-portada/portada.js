(() => {
    const splash = document.querySelector(".splash-screen");

    if (!splash) return;

    // El logo aparece suavemente y permanece visible.
    // Esperamos 3 segundos desde que termina su animación.
    const tiempoVisible = 3000;
    const tiempoEntrada = 1200;
    const tiempoSalida = 800;

    window.setTimeout(() => {
        splash.classList.add("is-leaving");

        window.setTimeout(() => {
            splash.remove();

            // Próximo módulo: inicio de sesión.
            // Todavía no redirigimos porque falta construirlo.
        }, tiempoSalida);

    }, tiempoEntrada + tiempoVisible);
})();
