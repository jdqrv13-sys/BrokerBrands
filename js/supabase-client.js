// Configuración de cliente Supabase
// REEMPLAZA ESTOS VALORES CON LOS DE TU PROYECTO DE SUPABASE
const SUPABASE_URL = 'https://djjrnusiugsvjjlybvwk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_B6iXsh8mt9tnlm4l2xp2Tg_cpSONeS9';

// Inicializar Supabase globalmente
window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
