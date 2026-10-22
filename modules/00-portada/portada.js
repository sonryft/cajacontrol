(() => {
    const iniciar = () => {
        const splash = document.querySelector(".splash-screen");

        if (!splash) {
            window.location.replace("../01-login/index.html");
            return;
        }

        // Mantener la portada visible durante la animación.
        window.setTimeout(() => {
            splash.classList.add("is-leaving");

            window.setTimeout(() => {
                window.location.href = "../01-login/index.html";
            }, 800);

        }, 4200);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();
