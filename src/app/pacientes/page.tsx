"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Phone, Plus, Search, Users, Mail, ChevronRight } from "lucide-react";
import { usePacientes, useConsultas } from "@/lib/hooks";
import { iniciais } from "@/lib/utils";
import PacienteModal from "@/components/PacienteModal";
import { Paciente } from "@/lib/types";

export default function PacientesPage() {
  const { pacientes, criarPaciente, atualizarPaciente, removerPaciente } = usePacientes();
  const { consultas } = useConsultas();
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [pacienteEditando, setPacienteEditando] = useState<Paciente | null>(null);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return pacientes;
    return pacientes.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.telefone.replace(/\D/g, "").includes(termo.replace(/\D/g, ""))
    );
  }, [pacientes, busca]);

  function contarConsultas(pacienteId: string) {
    return consultas.filter((c) => c.pacienteId === pacienteId).length;
  }

  function abrirNovo() {
    setPacienteEditando(null);
    setModalAberto(true);
  }

  return (
    <div className="min-h-screen bg-canvas px-8 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-[26px] font-extrabold tracking-tight text-ink-900">
              Pacientes
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {pacientes.length} {pacientes.length === 1 ? "paciente cadastrado" : "pacientes cadastrados"}
            </p>
          </div>
          <button
            onClick={abrirNovo}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Novo paciente
          </button>
        </header>

        <div className="mb-5 relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou telefone"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-ink-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white py-20 text-center shadow-card">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-800">
                {pacientes.length === 0 ? "Nenhum paciente cadastrado" : "Nenhum resultado encontrado"}
              </p>
              <p className="text-sm text-slate-500">
                {pacientes.length === 0
                  ? "Cadastre o primeiro paciente para começar a agendar."
                  : "Tente buscar com outro nome ou telefone."}
              </p>
            </div>
            {pacientes.length === 0 && (
              <button
                onClick={abrirNovo}
                className="mt-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                + Novo paciente
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((p) => (
              <div
                key={p.id}
                className="flex flex-col items-start gap-3 rounded-2xl bg-white p-5 shadow-card transition-shadow hover:shadow-panel"
              >
                <Link href={`/pacientes/${p.id}`} className="flex w-full flex-col items-start gap-3">
                  <div className="flex w-full items-start justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                      {iniciais(p.nome)}
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                      {contarConsultas(p.id)} consulta{contarConsultas(p.id) === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-bold text-ink-900">
                      {p.nome}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{p.telefone}</span>
                    </div>
                    {p.email && (
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{p.email}</span>
                      </div>
                    )}
                  </div>
                </Link>
                <Link
                  href={`/pacientes/${p.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Ver prontuário
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <PacienteModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        pacienteEditando={pacienteEditando}
        onSalvar={async (dados) => {
          if (pacienteEditando) {
            await atualizarPaciente(pacienteEditando.id, dados);
          } else {
            await criarPaciente(dados);
          }
        }}
        onExcluir={removerPaciente}
      />
    </div>
  );
}
