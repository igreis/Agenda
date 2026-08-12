import { createBrowserClient } from "@supabase/ssr";

function obterUrlSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

export function criarClienteNavegador() {
  return createBrowserClient(
    obterUrlSupabase(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

