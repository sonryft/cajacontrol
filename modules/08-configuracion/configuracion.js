```javascript
/* ========================================
   CAJACONTROL — CONFIGURACIÓN
   Apariencia y preferencias del usuario
======================================== */

document.addEventListener("DOMContentLoaded", async function () {
    const supabaseClient = window.supabaseClient;

    const mensaje = document.getElementById("configuracion-message");
    const nombreEmpresa = document.getElementById("empresa-nombre");
    const nombreUsuario = document.getElementById("usuario-nombre");
    const rolUsuario = document.getElementById("usuario-rol");
    const avatar = document.getElementById("usuario-avatar");
    const fecha = document.getElementById("fecha-actual");
    const estadoTema = document.getElementById("estado-tema");
    const tarjetas = document.querySelectorAll(".theme-card");

    // ----------------------------------------
    // 1. PALETAS DE COLORES
    // ----------------------------------------

    const temas = {
        tierra: {
            background: "#f2e8d9",
            sidebar: "#e5d5bf",
            surface: "#fff8ed",
            surfaceHover: "#f4e7d5",
            border: "rgba(79,55,38,.16)",
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
            border: "rgba(255,255,255,.09)",
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
            border: "rgba(105,53,69,.16)",
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
            border: "rgba(35,73,50,.16)",
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
            border: "rgba(31,67,105,.16)",
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
            border: "rgba(35,40,48,.14)",
            text: "#222832",
            muted: "#69717e",
            accent: "#525e70",
            accentDark: "#d9dde4"
        }
    };

    const variablesCSS = {
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

    function mostrarMensaje(texto, tipo = "error") {
        console.error("CajaControl:", texto);

        if (mensaje) {
            mensaje.textContent = texto;
            mensaje.className = "mensaje visible " + tipo;
        }
    }

    // ----------------------------------------
    // 2. APLICAR Y GUARDAR EL TEMA
    // ----------------------------------------

    function aplicarTema(nombreTema) {
        if (!temas[nombreTema]) {
            nombreTema = "carbon";
        }

        const tema = temas[nombreTema];

        Object.entries(tema).forEach(function ([propiedad, valor]) {
            document.documentElement.style.setProperty(
                variablesCSS[propiedad],
                valor
            );
        });

        tarjetas.forEach(function (tarjeta) {
            const seleccionado = tarjeta.dataset.theme === nombreTema;

            tarjeta.classList.toggle("selected", seleccionado);
            tarjeta.setAttribute("aria-pressed", String(seleccionado));
        });

        try {
            localStorage.setItem("cajacontrol-tema", nombreTema);
        } catch (error) {
            console.warn("No se pudo guardar el tema en este navegador.");
        }

        if (estadoTema) {
            estadoTema.textContent =
                "Tema seleccionado: " + nombreTema.charAt(0).toUpperCase() +
                nombreTema.slice(1) +
                ". La preferencia está guardada en este navegador.";
        }
    }

    let temaGuardado = "carbon";

    try {
        temaGuardado = localStorage.getItem("cajacontrol-tema") || "carbon";
    } catch (error) {
        console.warn("No se pudo leer el tema guardado.");
    }

    aplicarTema(temaGuardado);

    tarjetas.forEach(function (tarjeta) {
        tarjeta.addEventListener("click", function () {
            aplicarTema(tarjeta.dataset.theme);
        });
    });

    // ----------------------------------------
    // 3. FECHA ACTUAL
    // ----------------------------------------

    if (fecha) {
        fecha.textContent = new Intl.DateTimeFormat("es-BO", {
            dateStyle: "long"
        }).format(new Date());
    }

    // ----------------------------------------
    // 4. COMPROBAR SUPABASE
    // ----------------------------------------

    if (!supabaseClient) {
        if (nombreEmpresa) {
            nombreEmpresa.textContent = "Error de conexión";
        }

        mostrarMensaje(
            "Supabase no está disponible. Comprueba la carga de supabase.js."
        );
        return;
    }

    try {
        // Verificar sesión
        const resultadoSesion = await supabaseClient.auth.getSession();

        if (resultadoSesion.error) {
            throw resultadoSesion.error;
        }

        const sesion = resultadoSesion.data.session;

        if (!sesion) {
            window.location.replace("../01-login/index.html");
            return;
        }

        const usuario = sesion.user;

        // ----------------------------------------
        // 5. OBTENER PERFIL
        // ----------------------------------------

        const resultadoPerfil = await supabaseClient
            .from("perfiles")
            .select("id, empresa_id, nombre, rol, activo")
            .eq("id", usuario.id)
            .maybeSingle();

        if (resultadoPerfil.error) {
            throw new Error(
                "No se pudo consultar el perfil: " +
                resultadoPerfil.error.message
            );
        }

        const perfil = resultadoPerfil.data;

        if (!perfil || !perfil.activo) {
            await supabaseClient.auth.signOut();
            window.location.replace("../01-login/index.html");
            return;
        }

        // Mostrar nombre del usuario
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

        // ----------------------------------------
        // 6. OBTENER EMPRESA
        // ----------------------------------------

        if (nombreEmpresa) {
            nombreEmpresa.textContent = "Cargando empresa...";
        }

        if (!perfil.empresa_id) {
            if (nombreEmpresa) {
                nombreEmpresa.textContent = "Sin empresa asignada";
            }
        } else {
            const resultadoEmpresa = await supabaseClient
                .from("empresas")
                .select("id, nombre")
                .eq("id", perfil.empresa_id)
                .maybeSingle();

            if (resultadoEmpresa.error) {
                throw new Error(
                    "No se pudo consultar la empresa: " +
                    resultadoEmpresa.error.message
                );
            }

            const empresa = resultadoEmpresa.data;

            if (!empresa) {
                if (nombreEmpresa) {
                    nombreEmpresa.textContent = "Empresa no disponible";
                }

                throw new Error(
                    "No se encontró la empresa vinculada al perfil. " +
                    "Comprueba el empresa_id y las políticas RLS."
                );
            }

            if (nombreEmpresa) {
                nombreEmpresa.textContent =
                    empresa.nombre || "Empresa sin nombre";
            }

            console.log("CajaControl: empresa cargada correctamente.", {
                empresa: empresa.nombre,
                empresa_id: empresa.id
            });
        }

        // Compartir perfil con otros módulos
        window.cajaControlPerfil = perfil;

        console.log("CajaControl: configuración cargada.", {
            usuario: nombre,
            rol: perfil.rol,
            empresa_id: perfil.empresa_id
        });

        // ----------------------------------------
        // 7. CERRAR SESIÓN
        // ----------------------------------------

        const botonSalir = document.getElementById("cerrar-sesion");

        if (botonSalir) {
            botonSalir.addEventListener("click", async function () {
                botonSalir.disabled = true;

                try {
                    const resultadoSalida =
                        await supabaseClient.auth.signOut();

                    if (resultadoSalida.error) {
                        throw resultadoSalida.error;
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
        console.error("Error en Configuración:", error);

        if (
            nombreEmpresa &&
            nombreEmpresa.textContent === "Cargando empresa..."
        ) {
            nombreEmpresa.textContent = "Error al cargar empresa";
        }

        mostrarMensaje(
            "No se pudo cargar la configuración: " +
            (error.message || "Error desconocido.")
        );
    }
});
```
