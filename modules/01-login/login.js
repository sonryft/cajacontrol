document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("login-form");
    const campoEmail = document.getElementById("email");
    const campoPassword = document.getElementById("password");
    const botonLogin = document.getElementById("login-button");
    const botonMostrar = document.getElementById("toggle-password");
    const mensaje = document.getElementById("login-message");

    if (!formulario || !campoEmail || !campoPassword ||
        !botonLogin || !botonMostrar || !mensaje) {
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

    botonMostrar.addEventListener("click", () => {
        const mostrar = campoPassword.type === "password";
        campoPassword.type = mostrar ? "text" : "password";
        botonMostrar.textContent = mostrar ? "Ocultar" : "Mostrar";
    });

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        ocultarMensaje();

        const email = campoEmail.value.trim();
        const password = campoPassword.value;

        if (!email || !password) {
            mostrarMensaje("Introduce tu correo y contraseña.");
            return;
        }

        if (!window.supabaseClient) {
            mostrarMensaje("No se pudo conectar con Supabase.");
            console.error("No existe window.supabaseClient.");
            return;
        }

        botonLogin.disabled = true;
        botonLogin.textContent = "Verificando...";

        try {
            const { data, error } =
                await window.supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) {
                mostrarMensaje(
                    error.message === "Invalid login credentials"
                        ? "Correo o contraseña incorrectos."
                        : "No se pudo iniciar sesión: " + error.message
                );
                return;
            }

            if (!data.user) {
                mostrarMensaje("No se pudo verificar tu usuario.");
                return;
            }

            mostrarMensaje("Acceso correcto. Abriendo el panel...", "exito");

            window.setTimeout(() => {
                window.location.href = "../02-dashboard/index.html";
            }, 500);

        } catch (error) {
            console.error("Error de inicio de sesión:", error);
            mostrarMensaje("Error de conexión. Inténtalo nuevamente.");

        } finally {
            botonLogin.disabled = false;
            botonLogin.textContent = "Iniciar sesión";
        }
    });
});
