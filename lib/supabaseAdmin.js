import { createClient } from "@supabase/supabase-js";

// POZOR: tenhle soubor se smí importovat jen v serverovém kódu (API routes),
// nikdy v komponentách s "use client" - service_role klíč nesmí nikdy
// skončit v kódu, co se posílá do prohlížeče.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
