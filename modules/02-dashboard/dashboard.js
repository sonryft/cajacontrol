```javascript
/* ========================================
   CAJACONTROL — PANEL PRINCIPAL
   Módulo 02: Dashboard
======================================== */

document.addEventListener("DOMContentLoaded", async () => {
    const mensaje = document.getElementById("dashboard-message");
    const supabaseClient = window.supabaseClient;

    function mostrarError(texto) {
        console.error("CajaControl:", texto);

        if (mensaje) {
            mensaje.textContent = texto;
            mensaje.className = "mensaje visible error";
        } else {
            alert(texto);
        }
    }

    if (!supabaseClient) {
        mostrarError("No se pudo conectar con Supabase. Revisa supabase.js.");
        return;
    }

    try {
        // 1. Verificar sesión
        const { data: sesionData, error: sesionError } =
            await supabaseClient.auth.getSession();

        if (sesionError) throw sesionError;

        if (!sesionData.session) {
            window.location.replace("../01-login/index.html");
            return;
        }

        const usuario = sesionData.session.user;

        // 2. Buscar perfil del usuario
        const { data: perfil, error: perfilError } =
            await supabaseClient
                .from("perfiles")
                .select("id, empresa_id, nombre, rol, activo")
                .eq("id", usuario.id)
                .maybeSingle();

        if (perfilError) {
            throw new Error("Error al consultar el perfil: " + perfilError.message);
        }

        if (!perfil || !perfil.activo) {
            await supabaseClient.auth.signOut();
            mostrarError("No se encontró un perfil activo para este usuario.");
            return;
        }

        // 3. Mostrar datos del usuario
        const nombreUsuario = document.getElementById("usuario-nombre");
        const rolUsuario = document.getElementById("usuario-rol");
        const saludoNombre = document.getElementById("saludo-nombre");
        const avatar = document.getElementById("usuario-avatar");

        if (nombreUsuario) nombreUsuario.textContent = perfil.nombre;
        if (saludoNombre) saludoNombre.textContent = perfil.nombre;
        if (rolUsuario) {
            rolUsuario.textContent =
                perfil.rol === "administrador" ? "Administrador" : perfil.rol;
        }
        if (avatar) {
            avatar.textContent = (perfil.nombre || "U").charAt(0).toUpperCase();
        }

        // 4. Consultar empresa
        const nombreEmpresa = document.getElementById("empresa-nombre");

        if (!perfil.empresa_id) {
            if (nombreEmpresa) nombreEmpresa.textContent = "Sin empresa asignada";
        } else {
            const { data: empresa, error: empresaError } =
                await supabaseClient
                    .from("empresas")
                    .select("nombre")
                    .eq("id", perfil.empresa_id)
                    .maybeSingle();

            if (empresaError) {
                throw new Error("Error al consultar la empresa: " + empresaError.message);
            }

            if (!empresa) {
                throw new Error(
                    "No se encontró la empresa vinculada al perfil. Revisa los permisos RLS."
                );
            }

            if (nombreEmpresa) {
                nombreEmpresa.textContent = empresa.nombre;
            }
        }

        // 5. Mostrar fecha actual
        const fecha = document.getElementById("fecha-actual");

        if (fecha) {
            fecha.textContent = new Intl.DateTimeFormat("es-BO", {
                dateStyle: "long"
            }).format(new Date());
        }

        // 6. Guardar perfil para otros módulos
        window.cajaControlPerfil = perfil;

        console.log("CajaControl: panel cargado correctamente.", {
            usuario: perfil.nombre,
            empresa_id: perfil.empresa_id,
            rol: perfil.rol
        });

        // 7. Cerrar sesión
        const botonSalir = document.getElementById("cerrar-sesion");

        if (botonSalir) {
            botonSalir.addEventListener("click", async () => {
                botonSalir.disabled = true;

                const { error } = await supabaseClient.auth.signOut();

                if (error) {
                    mostrarError("No se pudo cerrar sesión: " + error.message);
                    botonSalir.disabled = false;
                    return;
                }

                window.location.replace("../01-login/index.html");
            });
        }

    } catch (error) {
        console.error("Error al cargar CajaControl:", error);
        mostrarError(error.message || "No se pudo cargar el panel.");
    }
});
```
