"use client";

import { criarClienteNavegador } from "@/lib/supabase/client";
import { Stethoscope } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function fazerLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setEnviando(true);

    const supabase = criarClienteNavegador();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro("E-mail ou senha inválidos.");
      setEnviando(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef6f5] px-5 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-7 shadow-panel sm:p-8">
        <div className="mb-7 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500 text-white">
            <Stethoscope className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-ink-900">
              DentaAgenda
            </h1>
            <p className="text-sm text-slate-500">Acesse sua conta</p>
          </div>
        </div>

        <form onSubmit={fazerLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-900">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500"
              placeholder="voce@consultorio.com"
            />
          </div>

          <div>
            <label htmlFor="senha" className="mb-1.5 block text-sm font-medium text-ink-900">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500"
              placeholder="Sua senha"
            />
          </div>

          {erro && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
          Sua conta é criada diretamente no painel do Supabase em Authentication → Users.
        </p>
      </section>
    </main>
  );
}
