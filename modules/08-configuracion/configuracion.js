```javascript
/* ========================================
   CAJACONTROL — CONFIGURACIÓN
   Apariencia y preferencias del usuario
======================================== */

document.addEventListener("DOMContentLoaded", async () => {
    const supabaseClient = window.supabaseClient;
    const mensaje = document.getElementById("configuracion-message");
    const nombreEmpresa = document.getElementById("empresa-nombre");
    const nombreUsuario = document.getElementById("usuario-nombre");
    const rolUsuario = document.getElementById("usuario-rol");
    const avatar = document.getElementById("usuario-avatar");
    const fecha = document.getElementById("fecha-actual");
    const estadoTema = document.getElementById("estado-tema");
    const tarjetas = document.querySelectorAll(".theme-card");

    const temas = {
        tierra: {
            background: "#f2e8d9",
            sidebar: "#e5d5bf",
            surface: "#fff8ed",
            surfaceHover: "#f4e7d5",
            border: "rgba(79, 55, 38, 0.16)",
            text: "#38291f",
            muted: "#806b5b",
            accent: "#936744",
            accentDark: "#d8c2a8"
        },
        carbon: {
            background: "#08090c",
            sidebar: "#0d0f14",
            surface: "#11141b",
            surfaceHover: "#171b24",
            border: "rgba(255, 255, 255, 0.09)",
            text: "#f4f5f7",
            muted: "#9298a6",
            accent: "#b7f36b",
            accentDark: "#26391b"
        },
        rosa: {
            background: "#fff5f5",
            sidebar: "#f6e5e8",
            surface: "#fffafa",
            surfaceHover: "#f8e9ec",
            border: "rgba(105, 53, 69, 0.16)",
            text: "#402a32",
            muted: "#896d77",
            accent: "#b76e87",
            accentDark: "#edd0da"
        },
        bosque: {
            background: "#edf3eb",
            sidebar: "#dce8db",
            surface: "#f8fbf5",
            surfaceHover: "#e4eee1",
            border: "rgba(35, 73, 50, 0.16)",
            text: "#20372b",
            muted: "#647d6b",
            accent: "#36754f",
            accentDark: "#c8ddca"
        },
        oceano: {
            background: "#edf5fc",
            sidebar: "#dce9f6",
            surface: "#f8fbff",
            surfaceHover: "#e4effa",
            border: "rgba(31, 67, 105, 0.16)",
            text: "#1d3046",
            muted: "#647d98",
            accent: "#347eb9",
            accentDark: "#c8e1f5"
        },
        nieve: {
            background: "#f3f4f6",
            sidebar: "#e7e9ed",
            surface: "#ffffff",
            surfaceHover: "#eef0f3",
            border: "rgba(35, 40, 48, 0.14)",
            text: "#222832",
            muted: "#69717e",
            accent: "#525e70",
            accentDark: "#d9dde4"
        }
    };

    function mostrarMensaje(texto, tipo = "error") {
        console.log("CajaControl:", texto);

        if (mensaje) {
            mensaje.textContent = texto;
            mensaje.className = "mensaje visible " + tipo;
        }
    }

    function aplicarTema(nombreTema) {
        const tema = temas[nombreTema];

        if (!tema) {
            nombreTema = "carbon";
            Object.assign(
                document.documentElement.style,
                {}
            );
        }

        const seleccionado = temas[nombreTema];

        Object.entries(seleccionado).forEach(([propiedad, valor]) => {
            const nombresVariables = {
                background: "--background",
                sidebar: "--sidebar",
                surface: "--surface",
                surfaceHover: "--surface-hover",
                border: "--border",
                text: "--text",
                muted: "--muted",
                accent: "--accent",
                accentDark: "--accent-dark"
            };

            document.documentElement.style.setProperty(
                nombresVariables[propiedad],
                valor
            );
        });

        tarjetas.forEach((tarjeta) => {
            const activo = tarjeta.dataset.theme === nombreTema;
            tarjeta.classList.toggle("selected", activo);
            tarjeta.setAttribute("aria-pressed", String(activo));
        });

        localStorage.setItem("cajacontrol-tema", nombreTema);

        if (estadoTema) {
            estadoTema.textContent =
                "Tema seleccionado: " +
                tarjetaNombre(nombreTema) +
                ". La preferencia está guardada en este navegador.";
        }
    }

    function tarjetaNombre(nombreTema) {
        const nombres = {
            tierra: "Tierra",
            carbon: "Carbón",
            rosa: "Rosa",
            bosque: "Bosque",
            oceano: "Océano",
            nieve: "Nieve"
        };

        return nombres[nombreTema] || "Carbón";
    }

    // Aplicar el tema guardado en este navegador.
    const temaGuardado = localStorage.getItem("cajacontrol-tema") || "carbon";
    aplicarTema(temaGuardado);

    // Cambiar el tema al seleccionar una tarjeta.
    tarjetas.forEach((tarjeta) => {
        tarjeta.addEventListener("click", () => {
            aplicarTema(tarjeta.dataset.theme);
        });
    });

    // Mostrar fecha.
    if (fecha) {
        fecha.textContent = new Intl.DateTimeFormat("es-BO", {
            dateStyle: "long"
        }).format(new Date());
    }

    // Verificar que Supabase está disponible.
    if (!supabaseClient) {
        mostrarMensaje(
            "No se pudo conectar con Supabase. Comprueba supabase.js."
        );
        return;
    }

    try {
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

        const { data: perfil, error: perfilError } =
            await supabaseClient
                .from("perfiles")
                .select("id, empresa_id, nombre, rol, activo")
                .eq("id", usuario.id)
                .maybeSingle();

        if (perfilError) {
            throw perfilError;
        }

        if (!perfil || !perfil.activo) {
            await supabaseClient.auth.signOut();
            window.location.replace("../01-login/index.html");
            return;
        }

        const nombre = perfil.nombre || usuario.email || "Usuario";

        if (nombreUsuario) {
            nombreUsuario.textContent = nombre;
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

        if (!perfil.empresa_id) {
            if (nombreEmpresa) {
                nombreEmpresa.textContent = "Sin empresa asignada";
            }
        } else {
            const { data: empresa, error: empresaError } =
                await supabaseClient
                    .from("empresas")
                    .select("nombre")
                    .eq("id", perfil.empresa_id)
                    .maybeSingle();

            if (empresaError) {
                throw empresaError;
            }

            if (nombreEmpresa) {
                nombreEmpresa.textContent =
                    empresa?.nombre || "Empresa no disponible";
            }
        }

        window.cajaControlPerfil = perfil;

        console.log("CajaControl: configuración cargada.", {
            usuario: nombre,
            empresa_id: perfil.empresa_id
        });

        const botonSalir = document.getElementById("cerrar-sesion");

        if (botonSalir) {
            botonSalir.addEventListener("click", async () => {
                botonSalir.disabled = true;

                try {
                    const { error } = await supabaseClient.auth.signOut();

                    if (error) {
                        throw error;
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
        console.error("Error en configuración:", error);
        mostrarMensaje(
            "No se pudo cargar la configuración: " + error.message
        );
    }
});
```
