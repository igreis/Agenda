"use client";

import { useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useConsultas, usePacientes, useAtendimentos } from "@/lib/hooks";
import { capitalizar, hojeISO } from "@/lib/utils";
import ConsultaModal from "@/components/ConsultaModal";
import AtendimentoModal from "@/components/AtendimentoModal";
import MonthView from "@/components/agenda/MonthView";
import WeekView from "@/components/agenda/WeekView";
import DayAgendaList from "@/components/agenda/DayAgendaList";
import { Consulta } from "@/lib/types";

type Visao = "mes" | "semana" | "dia";

export default function AgendaPage() {
  const { consultas, criarConsulta, atualizarConsulta, removerConsulta, recarregar: recarregarConsultas } = useConsultas();
  const { pacientes, recarregar: recarregarPacientes } = usePacientes();
  const { criarAtendimento } = useAtendimentos();

  const [visao, setVisao] = useState<Visao>("mes");
  const [referencia, setReferencia] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState(hojeISO());

  const [modalAberto, setModalAberto] = useState(false);
  const [consultaEditando, setConsultaEditando] = useState<Consulta | null>(null);
  const [dataParaNova, setDataParaNova] = useState(hojeISO());

  const [modalAtendimentoAberto, setModalAtendimentoAberto] = useState(false);
  const [consultaAtendimento, setConsultaAtendimento] = useState<Consulta | null>(null);

  function abrirNova(dataISO: string) {
    setConsultaEditando(null);
    setDataParaNova(dataISO);
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

  function navegar(direcao: 1 | -1) {
    if (visao === "mes") {
      setReferencia((d) => (direcao === 1 ? addMonths(d, 1) : subMonths(d, 1)));
    } else if (visao === "semana") {
      setReferencia((d) => (direcao === 1 ? addWeeks(d, 1) : subWeeks(d, 1)));
    } else {
      setReferencia((d) => addDays(d, direcao));
      setDiaSelecionado((prev) => format(addDays(new Date(prev), direcao), "yyyy-MM-dd"));
    }
  }

  function irParaHoje() {
    const hoje = new Date();
    setReferencia(hoje);
    setDiaSelecionado(hojeISO());
  }

  const rotuloPeriodo = (() => {
    if (visao === "mes") return capitalizar(format(referencia, "MMMM yyyy", { locale: ptBR }));
    if (visao === "semana") {
      const inicio = startOfWeek(referencia);
      const fim = endOfWeek(referencia);
      const mesmoMes = format(inicio, "MMM") === format(fim, "MMM");
      return mesmoMes
        ? `${format(inicio, "d")} – ${format(fim, "d 'de' MMMM", { locale: ptBR })}`
        : `${format(inicio, "d MMM", { locale: ptBR })} – ${format(fim, "d MMM", { locale: ptBR })}`;
    }
    return capitalizar(format(referencia, "EEEE, d 'de' MMMM", { locale: ptBR }));
  })();

  return (
    <div className="min-h-screen bg-canvas px-8 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-[26px] font-extrabold tracking-tight text-ink-900">
              Agenda
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Visualize e organize os horários do consultório.
            </p>
          </div>
          <button
            onClick={() => abrirNova(diaSelecionado)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Nova consulta
          </button>
        </header>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navegar(-1)}
              className="grid h-9 w-9 place-items-center rounded-lg bg-white text-slate-500 shadow-card transition-colors hover:text-brand-600"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => navegar(1)}
              className="grid h-9 w-9 place-items-center rounded-lg bg-white text-slate-500 shadow-card transition-colors hover:text-brand-600"
              aria-label="Próximo"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <h2 className="ml-2 font-display text-lg font-bold capitalize text-ink-900">
              {rotuloPeriodo}
            </h2>
            <button
              onClick={irParaHoje}
              className="ml-2 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-500 shadow-card transition-colors hover:text-brand-600"
            >
              Hoje
            </button>
          </div>

          <div className="flex rounded-xl bg-white p-1 shadow-card">
            {(["mes", "semana", "dia"] as Visao[]).map((v) => (
              <button
                key={v}
                onClick={() => setVisao(v)}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium capitalize transition-colors ${
                  visao === v
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-brand-600"
                }`}
              >
                {v === "mes" ? "Mês" : v}
              </button>
            ))}
          </div>
        </div>

        {visao === "mes" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
            <MonthView
              mesReferencia={referencia}
              consultas={consultas}
              diaSelecionado={diaSelecionado}
              onSelecionarDia={setDiaSelecionado}
            />
            <DayAgendaList
              dataISO={diaSelecionado}
              consultas={consultas}
              onSelecionarConsulta={abrirEdicao}
              onNovaConsulta={abrirNova}
              onRegistrarAtendimento={abrirAtendimento}
            />
          </div>
        )}

        {visao === "semana" && (
          <WeekView
            semanaReferencia={referencia}
            consultas={consultas}
            onSelecionarConsulta={abrirEdicao}
            onNovaConsulta={abrirNova}
            onRegistrarAtendimento={abrirAtendimento}
          />
        )}

        {visao === "dia" && (
          <DayAgendaList
            dataISO={format(referencia, "yyyy-MM-dd")}
            consultas={consultas}
            onSelecionarConsulta={abrirEdicao}
            onNovaConsulta={abrirNova}
            onRegistrarAtendimento={abrirAtendimento}
          />
        )}
      </div>

      <ConsultaModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        pacientes={pacientes}
        consultaEditando={consultaEditando}
        dataInicial={dataParaNova}
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
