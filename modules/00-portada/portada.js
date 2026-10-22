(() => {
    const splash = document.querySelector(".splash-screen");

    if (!splash) {
        window.location.replace("../01-login/index.html");
        return;
    }

    const tiempoEntrada = 1200;
    const tiempoVisible = 1800;
    const tiempoSalida = 800;

    const parametros = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(
        window.location.hash.replace(/^#/, "")
    );

    const esRecuperacion =
        parametros.get("type") === "recovery" ||
        hash.get("type") === "recovery" ||
        hash.has("access_token") ||
        hash.has("error_code");

    const destino = esRecuperacion
        ? "../01-login/recuperar.html"
            + window.location.search
            + window.location.hash
        : "../01-login/index.html";

    window.setTimeout(() => {
        splash.classList.add("is-leaving");

        window.setTimeout(() => {
            window.location.replace(destino);
        }, tiempoSalida);

    }, tiempoEntrada + tiempoVisible);
})();
