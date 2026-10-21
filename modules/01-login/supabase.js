/* ========================================
   CAJACONTROL — CONEXIÓN CON SUPABASE
======================================== */

const SUPABASE_URL = "https://fpsdnshhyosmqccdinsn";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_BrcHw-AXiBBUxTW4E1Yz_g_B3CAF_ej";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
