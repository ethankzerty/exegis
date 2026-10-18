
/* =========================================
   EXEGIS
   SUPABASE CONFIGURATION
   ========================================= */

/*
   This file connects EXEGIS to its
   Supabase authentication and database
   services.

   IMPORTANT:
   Only use your publishable API key.
   Never include a secret or service-role key.
*/


// =====================================
// 1. SUPABASE PROJECT URL
// =====================================

const SUPABASE_URL =
    "https://zowpbaqkaagrupxawqck.supabase.co";


// =====================================
// 2. SUPABASE PUBLISHABLE KEY
// =====================================

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_2RGh4g-OssybEHTeci7cFg_mxzs85HE";


// =====================================
// 3. CONFIGURATION VALIDATION
// =====================================

if (
    !SUPABASE_URL.startsWith("https://") ||
    !SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_")
) {
    console.error(
        "EXEGIS: Supabase configuration is invalid."
    );
}
