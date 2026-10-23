/* ========================================
   CAJACONTROL — PANEL PRINCIPAL
   Módulo 02: Dashboard
======================================== */

document.addEventListener("DOMContentLoaded", async function () {

    // 1. APLICAR EL TEMA GUARDADO
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

    const variables = {
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

    try {
        const temaGuardado =
            localStorage.getItem("cajacontrol-tema") || "carbon";

        const tema = temas[temaGuardado] || temas.carbon;

        Object.entries(tema).forEach(function ([clave, valor]) {
            document.documentElement.style.setProperty(
                variables[clave],
                valor
            );
        });
    } catch (error) {
        console.warn("CajaControl: no se pudo aplicar el tema guardado.", error);
    }

    // 2. ELEMENTOS DEL PANEL
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

    // 3. COMPROBAR CONEXIÓN CON SUPABASE
    if (!supabaseClient) {
        mostrarMensaje(
            "No se pudo conectar con Supabase. Comprueba que supabase.js se carga antes que dashboard.js."
        );
        return;
    }

    try {

        // 4. VERIFICAR SESIÓN
        const resultadoSesion =
            await supabaseClient.auth.getSession();

        if (resultadoSesion.error) {
            throw new Error(
                "Error de sesión: " +
                resultadoSesion.error.message
            );
        }

        const sesion = resultadoSesion.data.session;

        if (!sesion) {
            window.location.replace("../01-login/index.html");
            return;
        }

        const usuario = sesion.user;

        // 5. CONSULTAR PERFIL
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
            mostrarMensaje(
                "No se encontró el perfil del usuario."
            );
            return;
        }

        if (!perfil.activo) {
            mostrarMensaje(
                "El perfil del usuario está inactivo."
            );
            return;
        }

        // 6. MOSTRAR INFORMACIÓN DEL USUARIO
        const nombre =
            perfil.nombre || usuario.email || "Usuario";

        const elementoNombre =
            document.getElementById("usuario-nombre");

        const elementoRol =
            document.getElementById("usuario-rol");

        const elementoSaludo =
            document.getElementById("saludo-nombre");

        const elementoAvatar =
            document.getElementById("usuario-avatar");

        if (elementoNombre) {
            elementoNombre.textContent = nombre;
        }

        if (elementoSaludo) {
            elementoSaludo.textContent = nombre;
        }

        if (elementoRol) {
            elementoRol.textContent =
                perfil.rol === "administrador"
                    ? "Administrador"
                    : perfil.rol || "Usuario";
        }

        if (elementoAvatar) {
            elementoAvatar.textContent =
                nombre.charAt(0).toUpperCase();
        }

        // 7. CONSULTAR Y MOSTRAR LA EMPRESA
        const elementoEmpresa =
            document.getElementById("empresa-nombre");

        if (elementoEmpresa) {
            elementoEmpresa.textContent = "Cargando empresa...";
        }

        if (!perfil.empresa_id) {

            if (elementoEmpresa) {
                elementoEmpresa.textContent =
                    "Sin empresa asignada";
            }

        } else {

            const resultadoEmpresa = await supabaseClient
                .from("empresas")
                .select("id, nombre")
                .eq("id", perfil.empresa_id)
                .maybeSingle();

            if (resultadoEmpresa.error) {
                if (elementoEmpresa) {
                    elementoEmpresa.textContent =
                        "Error al cargar empresa";
                }

                throw new Error(
                    "Error al consultar la empresa: " +
                    resultadoEmpresa.error.message
                );
            }

            const empresa = resultadoEmpresa.data;

            if (!empresa) {
                if (elementoEmpresa) {
                    elementoEmpresa.textContent =
                        "Empresa no disponible";
                }

                throw new Error(
                    "No se encontró la empresa asociada al perfil. Comprueba empresa_id y los permisos RLS."
                );
            }

            if (elementoEmpresa) {
                elementoEmpresa.textContent =
                    empresa.nombre || "Empresa sin nombre";
            }

            console.log(
                "CajaControl: empresa cargada:",
                empresa.nombre
            );
        }

        // 8. MOSTRAR FECHA ACTUAL
        const elementoFecha =
            document.getElementById("fecha-actual");

        if (elementoFecha) {
            elementoFecha.textContent =
                new Intl.DateTimeFormat("es-BO", {
                    dateStyle: "long"
                }).format(new Date());
        }

        // 9. COMPARTIR PERFIL CON OTROS MÓDULOS
        window.cajaControlPerfil = perfil;

        console.log(
            "CajaControl: panel cargado correctamente."
        );

        // 10. CERRAR SESIÓN
        const botonSalir =
            document.getElementById("cerrar-sesion");

        if (botonSalir) {
            botonSalir.addEventListener(
                "click",
                async function () {

                    botonSalir.disabled = true;

                    try {
                        const resultadoSalida =
                            await supabaseClient.auth.signOut();

                        if (resultadoSalida.error) {
                            throw resultadoSalida.error;
                        }

                        window.location.replace(
                            "../01-login/index.html"
                        );

                    } catch (error) {
                        mostrarMensaje(
                            "No se pudo cerrar sesión: " +
                            error.message
                        );

                        botonSalir.disabled = false;
                    }
                }
            );
        }

    } catch (error) {
        console.error(
            "Error al cargar CajaControl:",
            error
        );

        mostrarMensaje(
            error.message || "No se pudo cargar el panel."
        );
    }
});
