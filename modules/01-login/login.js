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

        const cliente = window.supabaseClient;

        if (!window.supabase || !cliente) {
            mostrarMensaje("No se pudo conectar con Supabase. Recarga la página.");
            return;
        }

        botonLogin.disabled = true;
        botonLogin.textContent = "Verificando...";

        try {
            const { data, error } = await cliente.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            if (!data.user) {
                throw new Error("No se pudo identificar al usuario.");
            }

            mostrarMensaje("Verificando tu perfil...", "exito");

            const { data: perfil, error: errorPerfil } = await cliente
                .from("perfiles")
                .select("id, empresa_id, nombre, rol, activo")
                .eq("id", data.user.id)
                .maybeSingle();

            if (errorPerfil) throw errorPerfil;

            if (!perfil || perfil.activo !== true) {
                await cliente.auth.signOut();
                throw new Error("Tu perfil no existe o está inactivo.");
            }

            if (!perfil.empresa_id) {
                await cliente.auth.signOut();
                throw new Error("Tu usuario no tiene una empresa asignada.");
            }

            mostrarMensaje("Acceso correcto. Abriendo el panel...", "exito");

            window.location.replace("../02-dashboard/index.html");

        } catch (error) {
            console.error("Error de inicio de sesión:", error);
            mostrarMensaje(error.message || "No se pudo iniciar sesión.");
            botonLogin.disabled = false;
            botonLogin.textContent = "Iniciar sesión";
        }
    });
});
