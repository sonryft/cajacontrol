```javascript
/* ========================================
   CAJACONTROL — PANEL PRINCIPAL
   Módulo 02: Dashboard
======================================== */

document.addEventListener("DOMContentLoaded", async () => {
    const contenido = document.querySelector("[data-dashboard]");
    const mensaje = document.getElementById("dashboard-message");

    function mostrarMensaje(texto, tipo = "error") {
        if (mensaje) {
            mensaje.textContent = texto;
            mensaje.className = `mensaje visible ${tipo}`;
        } else {
            console.log(texto);
        }
    }

    // Verificar que la biblioteca y la configuración existan.
    if (
        typeof window.supabase === "undefined" ||
        typeof window.supabaseClient === "undefined"
    ) {
        mostrarMensaje(
            "No se pudo conectar con Supabase. Verifica la configuración."
        );
        console.error("Falta configurar el cliente de Supabase.");
        return;
    }

    const supabaseClient = window.supabaseClient;

    try {
        // Comprobar si existe una sesión iniciada.
        const { data: sesionData, error: sesionError } =
            await supabaseClient.auth.getSession();

        if (sesionError) {
            throw sesionError;
        }

        if (!sesionData.session) {
            window.location.replace("../01-login/index.html");
            return;
        }

        const usuario = sesionData.session.user;

        // Buscar el perfil asociado al usuario autenticado.
        const { data: perfil, error: perfilError } = await supabaseClient
            .from("perfiles")
            .select("id, empresa_id, nombre, rol, activo")
            .eq("id", usuario.id)
            .maybeSingle();

        if (perfilError) {
            throw perfilError;
        }

        if (!perfil || !perfil.activo) {
            mostrarMensaje(
                "Tu cuenta no tiene un perfil activo. Contacta al administrador."
            );

            await supabaseClient.auth.signOut();
            return;
        }

        // Mostrar el nombre del usuario, si el HTML tiene ese elemento.
        const nombreUsuario = document.getElementById("usuario-nombre");

        if (nombreUsuario) {
            nombreUsuario.textContent = perfil.nombre;
        }

        // Mostrar el rol, si existe el elemento.
        const rolUsuario = document.getElementById("usuario-rol");

        if (rolUsuario) {
            rolUsuario.textContent =
                perfil.rol === "administrador" ? "Administrador" : "Vendedor";
        }

        // Mostrar el nombre de la empresa.
        if (perfil.empresa_id) {
            const { data: empresa, error: empresaError } = await supabaseClient
                .from("empresas")
                .select("nombre")
                .eq("id", perfil.empresa_id)
                .maybeSingle();

            if (empresaError) {
                throw empresaError;
            }

            const nombreEmpresa = document.getElementById("empresa-nombre");

            if (nombreEmpresa && empresa) {
                nombreEmpresa.textContent = empresa.nombre;
            }
        }

        // Guardar el perfil en memoria para usarlo durante esta página.
        window.cajaControlPerfil = perfil;

        // Avisar que el panel ya puede mostrar su contenido.
        if (contenido) {
            contenido.hidden = false;
        }

        mostrarMensaje("Sesión verificada correctamente.", "exito");

        console.log("CajaControl: sesión verificada.", {
            usuario: perfil.nombre,
            rol: perfil.rol
        });

        // Cerrar sesión.
        const botonSalir = document.getElementById("cerrar-sesion");

        if (botonSalir) {
            botonSalir.addEventListener("click", async () => {
                botonSalir.disabled = true;

                const { error } = await supabaseClient.auth.signOut();

                if (error) {
                    mostrarMensaje("No se pudo cerrar la sesión.");
                    botonSalir.disabled = false;
                    console.error(error);
                    return;
                }

                window.location.replace("../01-login/index.html");
            });
        }

    } catch (error) {
        console.error("Error al cargar CajaControl:", error);

        mostrarMensaje(
            "No se pudo cargar el panel. Comprueba la conexión e inténtalo nuevamente."
        );
    }
});
```
