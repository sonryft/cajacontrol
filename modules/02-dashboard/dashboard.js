```javascript
/* ========================================
   CAJACONTROL — PANEL PRINCIPAL
   Módulo 02: Dashboard
======================================== */

document.addEventListener("DOMContentLoaded", async () => {
    const mensaje = document.getElementById("dashboard-message");
    const supabaseClient = window.supabaseClient;

    function mostrarMensaje(texto, tipo = "error") {
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
        // 2. Verificar sesión del usuario
        const {
            data: sesionData,
            error: sesionError
        } = await supabaseClient.auth.getSession();

        if (sesionError) {
            throw new Error(
                "No se pudo verificar la sesión: " + sesionError.message
            );
        }

        if (!sesionData.session) {
            window.location.replace("../01-login/index.html");
            return;
        }

        const usuario = sesionData.session.user;

        // 3. Consultar el perfil del usuario
        const {
            data: perfil,
            error: perfilError
        } = await supabaseClient
            .from("perfiles")
            .select("id, empresa_id, nombre, rol, activo")
            .eq("id", usuario.id)
            .maybeSingle();

        if (perfilError) {
            throw new Error(
                "Error al consultar el perfil: " + perfilError.message
            );
        }

        if (!perfil) {
            await supabaseClient.auth.signOut();
            mostrarMensaje(
                "No se encontró el perfil de este usuario. Contacta al administrador."
            );
            return;
        }

        if (!perfil.activo) {
            await supabaseClient.auth.signOut();
            mostrarMensaje(
                "Tu perfil está inactivo. Contacta al administrador."
            );
            return;
        }

        // 4. Mostrar los datos del usuario
        const nombreUsuario = document.getElementById("usuario-nombre");
        const rolUsuario = document.getElementById("usuario-rol");
        const saludoNombre = document.getElementById("saludo-nombre");
        const avatar = document.getElementById("usuario-avatar");

        const nombre = perfil.nombre || usuario.email || "Usuario";

        if (nombreUsuario) {
            nombreUsuario.textContent = nombre;
        }

        if (saludoNombre) {
            saludoNombre.textContent = nombre;
        }

        if (rolUsuario) {
            rolUsuario.textContent =
                perfil.rol === "administrador"
                    ? "Administrador"
                    : perfil.rol || "Usuario";
        }

        if (avatar) {
            avatar.textContent = nombre.charAt(0).toUpperCase();
        }

        // 5. Mostrar el estado inicial de la empresa
        const nombreEmpresa = document.getElementById("empresa-nombre");

        if (nombreEmpresa) {
            nombreEmpresa.textContent = "Cargando empresa...";
        }

        // 6. Consultar la empresa vinculada al perfil
        if (!perfil.empresa_id) {
            if (nombreEmpresa) {
                nombreEmpresa.textContent = "Sin empresa asignada";
            }
        } else {
            const {
                data: empresa,
                error: empresaError
            } = await supabaseClient
                .from("empresas")
                .select("id, nombre")
                .eq("id", perfil.empresa_id)
                .maybeSingle();

            if (empresaError) {
                if (nombreEmpresa) {
                    nombreEmpresa.textContent = "Error al cargar empresa";
                }

                throw new Error(
                    "Error al consultar la empresa: " + empresaError.message
                );
            }

            if (!empresa) {
                if (nombreEmpresa) {
                    nombreEmpresa.textContent = "Empresa no disponible";
                }

                throw new Error(
                    "No se encontró la empresa asociada al perfil. Comprueba el empresa_id y los permisos RLS de Supabase."
                );
            }

            if (nombreEmpresa) {
                nombreEmpresa.textContent =
                    empresa.nombre || "Empresa sin nombre";
            }

            console.log("CajaControl: empresa cargada.", {
                id: empresa.id,
                nombre: empresa.nombre
            });
        }

        // 7. Mostrar la fecha actual
        const fecha = document.getElementById("fecha-actual");

        if (fecha) {
            fecha.textContent = new Intl.DateTimeFormat("es-BO", {
                dateStyle: "long"
            }).format(new Date());
        }

        // 8. Guardar perfil para otros módulos
        window.cajaControlPerfil = perfil;

        console.log("CajaControl: panel cargado correctamente.", {
            usuario: nombre,
            empresa_id: perfil.empresa_id,
            rol: perfil.rol
        });

        // 9. Cerrar sesión
        const botonSalir = document.getElementById("cerrar-sesion");

        if (botonSalir) {
            botonSalir.addEventListener("click", async () => {
                botonSalir.disabled = true;

                try {
                    const { error: salidaError } =
                        await supabaseClient.auth.signOut();

                    if (salidaError) {
                        throw salidaError;
                    }

                    window.location.replace("../01-login/index.html");
                } catch (error) {
                    mostrarMensaje(
                        "No se pudo cerrar sesión: " + error.message
                    );

                    botonSalir.disabled = false;
                }
            });
        }

    } catch (error) {
        console.error("Error al cargar CajaControl:", error);

        mostrarMensaje(
            error.message || "No se pudo cargar el panel."
        );
    }
});
```
