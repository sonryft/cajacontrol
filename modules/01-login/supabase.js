/* ========================================
   CAJACONTROL — CONEXIÓN CON SUPABASE
======================================== */

const SUPABASE_URL = "https://fpsdnshhyosmqccdinsn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "PEGA_AQUI_TU_CLAVE_PUBLICA";

window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const supabaseClient = window.supabaseClient;
