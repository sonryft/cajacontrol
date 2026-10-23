
/* ========================================
   CAJACONTROL — PANEL PRINCIPAL
   Módulo 02: Dashboard
======================================== */

document.addEventListener("DOMContentLoaded", async function () {
    const mensaje = document.getElementById("dashboard-message");
    const supabaseClient = window.supabaseClient;

    function mostrarMensaje(texto, tipo) {
        tipo = tipo || "error";
        console.log("CajaControl: " + texto);

        if (mensaje) {
            mensaje.textContent = texto;
            mensaje.className = "mensaje visible " + tipo;
        } else {
            console.error(texto);
        }
    }

    // 1. Verificar conexión con Supabase
    if (!supabaseClient) {
        mostrarMensaje(
            "No se pudo conectar con Supabase. Comprueba que supabase.js se carga antes que dashboard.js."
        );
        return;
    }

    try {
        // 2. Verificar sesión
        const resultadoSesion = await supabaseClient.auth.getSession();

        if (resultadoSesion.error) {
            throw new Error(
                "Error de sesión: " + resultadoSesion.error.message
            );
        }

        const sesion = resultadoSesion.data.session;

        if (!sesion) {
            window.location.replace("../01-login/index.html");
            return;
        }

        const usuario = sesion.user;

        // 3. Consultar perfil
        const resultadoPerfil = await supabaseClient
            .from("perfiles")
            .select("id, empresa_id, nombre, rol, activo")
            .eq("id", usuario.id)
            .maybeSingle();

        if (resultadoPerfil.error) {
            throw new Error(
                "Error al consultar el perfil: " +
                resultadoPerfil.error.message
            );
        }

        const perfil = resultadoPerfil.data;

        if (!perfil) {
            mostrarMensaje("No se encontró el perfil del usuario.");
            return;
        }

        if (!perfil.activo) {
            mostrarMensaje("El perfil del usuario está inactivo.");
            return;
        }

        // 4. Mostrar información del usuario
        const nombre = perfil.nombre || usuario.email || "Usuario";
        const elementoNombre = document.getElementById("usuario-nombre");
        const elementoRol = document.getElementById("usuario-rol");
        const elementoSaludo = document.getElementById("saludo-nombre");
        const elementoAvatar = document.getElementById("usuario-avatar");

        if (elementoNombre) elementoNombre.textContent = nombre;
        if (elementoSaludo) elementoSaludo.textContent = nombre;

        if (elementoRol) {
            elementoRol.textContent =
                perfil.rol === "administrador"
                    ? "Administrador"
                    : perfil.rol || "Usuario";
        }

        if (elementoAvatar) {
            elementoAvatar.textContent = nombre.charAt(0).toUpperCase();
        }

        // 5. Consultar empresa
        const elementoEmpresa = document.getElementById("empresa-nombre");

        if (elementoEmpresa) {
            elementoEmpresa.textContent = "Cargando empresa...";
        }

        if (!perfil.empresa_id) {
            if (elementoEmpresa) {
                elementoEmpresa.textContent = "Sin empresa asignada";
            }
        } else {
            const resultadoEmpresa = await supabaseClient
                .from("empresas")
                .select("id, nombre")
                .eq("id", perfil.empresa_id)
                .maybeSingle();

            if (resultadoEmpresa.error) {
                if (elementoEmpresa) {
                    elementoEmpresa.textContent = "Error al cargar empresa";
                }

                throw new Error(
                    "Error al consultar la empresa: " +
                    resultadoEmpresa.error.message
                );
            }

            const empresa = resultadoEmpresa.data;

            if (!empresa) {
                if (elementoEmpresa) {
                    elementoEmpresa.textContent = "Empresa no disponible";
                }

                throw new Error(
                    "La consulta no encontró la empresa. Comprueba empresa_id y los permisos RLS."
                );
            }

            if (elementoEmpresa) {
                elementoEmpresa.textContent =
                    empresa.nombre || "Empresa sin nombre";
            }

            console.log("CajaControl: empresa cargada:", empresa.nombre);
        }

        // 6. Mostrar fecha
        const elementoFecha = document.getElementById("fecha-actual");

        if (elementoFecha) {
            elementoFecha.textContent = new Intl.DateTimeFormat("es-BO", {
                dateStyle: "long"
            }).format(new Date());
        }

        // 7. Compartir perfil con otros módulos
        window.cajaControlPerfil = perfil;

        console.log("CajaControl: panel cargado correctamente.");

        // 8. Cerrar sesión
        const botonSalir = document.getElementById("cerrar-sesion");

        if (botonSalir) {
            botonSalir.addEventListener("click", async function () {
                botonSalir.disabled = true;

                const resultadoSalida =
                    await supabaseClient.auth.signOut();

                if (resultadoSalida.error) {
                    mostrarMensaje(
                        "No se pudo cerrar sesión: " +
                        resultadoSalida.error.message
                    );

                    botonSalir.disabled = false;
                    return;
                }

                window.location.replace("../01-login/index.html");
            });
        }

    } catch (error) {
        console.error("Error al cargar CajaControl:", error);
        mostrarMensaje(
            error.message || "No se pudo cargar el panel."
        );
    }
});
