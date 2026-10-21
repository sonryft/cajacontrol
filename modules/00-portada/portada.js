(() => {
    const splash = document.querySelector(".splash-screen");

    if (!splash) return;

    const tiempoEntrada = 1200;
    const tiempoVisible = 3000;
    const tiempoSalida = 800;

    window.setTimeout(() => {
        splash.classList.add("is-leaving");

        window.setTimeout(() => {
            splash.remove();
        }, tiempoSalida);

    }, tiempoEntrada + tiempoVisible);
})();
