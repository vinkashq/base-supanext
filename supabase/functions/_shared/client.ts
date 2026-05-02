import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

let client: SupabaseClient | null = null;

export const createAdminClient = () => {
  if (client) {
    return client;
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase URL or Key");
  }

  client = createClient(supabaseUrl, supabaseKey);

  return client;
};
