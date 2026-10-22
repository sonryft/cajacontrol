/* ========================================
   CAJACONTROL — INICIO DE SESIÓN
======================================== */

document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("login-form");
    const campoEmail = document.getElementById("email");
    const campoPassword = document.getElementById("password");
    const botonLogin = document.getElementById("login-button");
    const botonMostrar = document.getElementById("toggle-password");
    const mensaje = document.getElementById("login-message");

    if (
        !formulario ||
        !campoEmail ||
        !campoPassword ||
        !botonLogin ||
        !botonMostrar ||
        !mensaje
    ) {
        console.error("CajaControl: faltan elementos del formulario.");
        return;
    }

    function mostrarMensaje(texto, tipo = "error") {
        mensaje.textContent = texto;
        mensaje.className = `mensaje visible ${tipo}`;
    }

    function ocultarMensaje() {
        mensaje.textContent = "";
        mensaje.className = "mensaje";
    }

    // Mostrar u ocultar contraseña.
    botonMostrar.addEventListener("click", () => {
        const estaOculta = campoPassword.type === "password";

        campoPassword.type = estaOculta ? "text" : "password";
        botonMostrar.textContent = estaOculta ? "Ocultar" : "Mostrar";
    });

    // Inicio de sesión.
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        ocultarMensaje();

        const email = campoEmail.value.trim();
        const password = campoPassword.value;

        if (!email || !password) {
            mostrarMensaje("Introduce tu correo y contraseña.");
            return;
        }

        if (
            typeof window.supabase === "undefined" ||
            typeof window.supabaseClient === "undefined"
        ) {
            mostrarMensaje(
                "No se pudo conectar con el sistema. Recarga la página."
            );

            console.error(
                "No se encontró la biblioteca de Supabase o su configuración."
            );

            return;
        }

        const cliente = window.supabaseClient;

        botonLogin.disabled = true;
        botonLogin.textContent = "Verificando...";

        try {
            const { data, error } = await cliente.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.error("Error de autenticación:", error);

                mostrarMensaje(
                    "Error de inicio de sesión: " + error.message
                );

                return;
            }

            if (data.user) {
                mostrarMensaje(
                    "Autenticación correcta. Preparando tu acceso...",
                    "exito"
                );

                console.log("Sesión iniciada correctamente.", data.user.id);
            } else {
                mostrarMensaje(
                    "No se recibió información del usuario. Inténtalo nuevamente."
                );
            }

        } catch (error) {
            console.error("Error inesperado:", error);

            mostrarMensaje(
                "Ocurrió un error de conexión. Inténtalo nuevamente."
            );

        } finally {
            botonLogin.disabled = false;
            botonLogin.textContent = "Iniciar sesión";
        }
    });
});
