"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  XCircle,
  ChevronRight,
  CalendarX2,
  ClipboardPlus,
  Pencil,
} from "lucide-react";
import { useConsultas, usePacientes, useAtendimentos } from "@/lib/hooks";
import { capitalizar, formatarDataLonga, hojeISO, iniciais, podeRegistrarAtendimento } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";
import ConsultaModal from "@/components/ConsultaModal";
import AtendimentoModal from "@/components/AtendimentoModal";
import { Consulta } from "@/lib/types";

function StatCard({
  icon: Icon,
  valor,
  label,
  tom,
}: {
  icon: any;
  valor: number;
  label: string;
  tom: "brand" | "amber" | "emerald" | "rose";
}) {
  const tons = {
    brand: "bg-brand-50 text-brand-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-card">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tons[tom]}`}>
        <Icon className="h-5 w-5" strokeWidth={2.2} />
      </div>
      <div>
        <p className="font-display text-2xl font-extrabold leading-none text-ink-900">
          {valor}
        </p>
        <p className="mt-1 text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function PainelPage() {
  const { consultas, criarConsulta, atualizarConsulta, removerConsulta, recarregar: recarregarConsultas } = useConsultas();
  const { pacientes, recarregar: recarregarPacientes } = usePacientes();
  const { criarAtendimento } = useAtendimentos();
  const [modalAberto, setModalAberto] = useState(false);
  const [consultaEditando, setConsultaEditando] = useState<Consulta | null>(null);
  const [modalAtendimentoAberto, setModalAtendimentoAberto] = useState(false);
  const [consultaAtendimento, setConsultaAtendimento] = useState<Consulta | null>(null);

  const hoje = hojeISO();

  const consultasHoje = useMemo(
    () =>
      consultas
        .filter((c) => c.data === hoje)
        .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)),
    [consultas, hoje]
  );

  const proximas = useMemo(
    () => consultas.filter((c) => c.data > hoje && c.status !== "cancelado"),
    [consultas, hoje]
  );

  const concluidasHoje = consultasHoje.filter((c) => c.status === "concluido").length;
  const canceladasHoje = consultasHoje.filter((c) => c.status === "cancelado").length;

  function abrirNova() {
    setConsultaEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(c: Consulta) {
    setConsultaEditando(c);
    setModalAberto(true);
  }

  function abrirAtendimento(c: Consulta) {
    setConsultaAtendimento(c);
    setModalAtendimentoAberto(true);
  }

  const pacienteAtendimento = pacientes.find((p) => p.id === consultaAtendimento?.pacienteId) ?? null;

  const saudacao = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  return (
    <div className="min-h-screen bg-canvas px-8 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-[26px] font-extrabold tracking-tight text-ink-900">
              {saudacao} 👋
            </h1>
            <p className="mt-1 text-sm capitalize text-slate-500">
              {capitalizar(formatarDataLonga(hoje))}
            </p>
          </div>
          <button
            onClick={abrirNova}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Nova consulta
          </button>
        </header>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={CalendarDays} valor={consultasHoje.length} label="Hoje" tom="brand" />
          <StatCard icon={Clock} valor={proximas.length} label="Próximas" tom="amber" />
          <StatCard
            icon={CheckCircle2}
            valor={concluidasHoje}
            label="Concluídas hoje"
            tom="emerald"
          />
          <StatCard icon={XCircle} valor={canceladasHoje} label="Canceladas hoje" tom="rose" />
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ink-900">Consultas de hoje</h2>
            <Link
              href="/agenda"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Ver agenda
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {consultasHoje.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
                <CalendarX2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink-800">Nenhuma consulta para hoje</p>
                <p className="text-sm text-slate-500">Sua agenda de hoje está livre.</p>
              </div>
              <button
                onClick={abrirNova}
                className="mt-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                + Agendar consulta
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {consultasHoje.map((c) => (
                <li key={c.id} className="-mx-2 flex items-center gap-2 rounded-lg px-2 py-3.5 hover:bg-slate-50">
                  <button
                    onClick={() => abrirEdicao(c)}
                    className="flex min-w-0 flex-1 items-center gap-4 text-left"
                  >
                    <div className="w-16 shrink-0">
                      <p className="text-sm font-semibold text-ink-900">{c.horaInicio}</p>
                      <p className="text-xs text-slate-400">{c.duracaoMin}min</p>
                    </div>
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      {iniciais(c.pacienteNome)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900">
                        {c.pacienteNome}
                      </p>
                      <p className="truncate text-sm text-slate-500">{c.procedimento}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </button>
                  <div className="flex shrink-0 gap-1">
                    {podeRegistrarAtendimento(c) && (
                      <button
                        onClick={() => abrirAtendimento(c)}
                        title="Registrar atendimento"
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                      >
                        <ClipboardPlus className="h-3.5 w-3.5" />
                        Atendimento
                      </button>
                    )}
                    <button
                      onClick={() => abrirEdicao(c)}
                      title="Editar consulta"
                      className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-600"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <ConsultaModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        pacientes={pacientes}
        consultaEditando={consultaEditando}
        dataInicial={hoje}
        onSalvar={async (dados) => {
          if (consultaEditando) {
            await atualizarConsulta(consultaEditando.id, dados);
          } else {
            await criarConsulta(dados);
          }
        }}
        onExcluir={removerConsulta}
      />

      <AtendimentoModal
        aberto={modalAtendimentoAberto}
        onFechar={() => setModalAtendimentoAberto(false)}
        consulta={consultaAtendimento}
        paciente={pacienteAtendimento}
        onSalvar={async (dados) => {
          await criarAtendimento(dados);
          await Promise.all([recarregarConsultas(), recarregarPacientes()]);
        }}
      />
    </div>
  );
}
