(() => {
    "use strict";

    const formulario = document.getElementById("login-form");
    const campoContrasena = document.getElementById("contrasena");
    const botonMostrar = document.getElementById("mostrar-password");
    const mensaje = document.getElementById("mensaje");

    // Mostrar u ocultar la contraseña.
    botonMostrar.addEventListener("click", () => {
        const mostrar = campoContrasena.type === "password";

        campoContrasena.type = mostrar ? "text" : "password";
        botonMostrar.textContent = mostrar ? "Ocultar" : "Mostrar";
        botonMostrar.setAttribute(
            "aria-label",
            mostrar ? "Ocultar contraseña" : "Mostrar contraseña"
        );
    });

    // Preparar el formulario sin simular un inicio de sesión real.
    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();

        mensaje.textContent =
            "El inicio de sesión todavía no está conectado. " +
            "El siguiente paso será configurar la autenticación segura.";

        mensaje.className = "mensaje visible error";
    });
})();
