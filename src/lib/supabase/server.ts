import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function obterUrlSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

export async function criarClienteServidor() {
  const cookieStore = await cookies();

  return createServerClient(
    obterUrlSupabase(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // chamado a partir de um Server Component — pode ignorar por
            // enquanto (não há middleware de sessão configurado ainda)
          }
        },
      },
    }
  );
}

