"use client";

import { addDays, format, isToday, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Consulta } from "@/lib/types";
import { podeRegistrarAtendimento } from "@/lib/utils";
import { ClipboardPlus, Plus } from "lucide-react";
import StatusBadge from "../StatusBadge";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function WeekView({
  semanaReferencia,
  consultas,
  onSelecionarConsulta,
  onNovaConsulta,
  onRegistrarAtendimento,
}: {
  semanaReferencia: Date;
  consultas: Consulta[];
  onSelecionarConsulta: (c: Consulta) => void;
  onNovaConsulta: (dataISO: string) => void;
  onRegistrarAtendimento?: (c: Consulta) => void;
}) {
  const inicio = startOfWeek(semanaReferencia);
  const dias = Array.from({ length: 7 }, (_, i) => addDays(inicio, i));

  return (
    <div className="grid grid-cols-7 gap-3">
      {dias.map((dia, idx) => {
        const dataISO = format(dia, "yyyy-MM-dd");
        const eHoje = isToday(dia);
        const eventos = consultas
          .filter((c) => c.data === dataISO)
          .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

        return (
          <div
            key={dataISO}
            className={`flex flex-col rounded-2xl bg-white shadow-card ${
              eHoje ? "ring-2 ring-brand-400" : ""
            }`}
          >
            <div className="border-b border-slate-100 px-3 py-2.5 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {DIAS_SEMANA[idx]}
              </p>
              <p
                className={`font-display text-lg font-bold ${
                  eHoje ? "text-brand-600" : "text-ink-900"
                }`}
              >
                {format(dia, "d", { locale: ptBR })}
              </p>
            </div>
            <div className="flex-1 space-y-1.5 p-2">
              {eventos.length === 0 ? (
                <p className="px-1 py-3 text-center text-[11px] text-slate-300">Livre</p>
              ) : (
                eventos.map((ev) => (
                  <div key={ev.id} className="group relative">
                    <button
                      onClick={() => onSelecionarConsulta(ev)}
                      className="block w-full rounded-lg border border-slate-100 bg-slate-50/70 p-2 text-left transition-colors hover:border-brand-200 hover:bg-brand-50/60"
                    >
                      <p className="text-xs font-semibold text-ink-900">{ev.horaInicio}</p>
                      <p className="truncate text-xs text-slate-600">{ev.pacienteNome}</p>
                      <div className="mt-1">
                        <StatusBadge status={ev.status} />
                      </div>
                    </button>
                    {onRegistrarAtendimento && podeRegistrarAtendimento(ev) && (
                      <button
                        onClick={() => onRegistrarAtendimento(ev)}
                        title="Registrar atendimento"
                        className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded bg-emerald-600 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <ClipboardPlus className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
              <button
                onClick={() => onNovaConsulta(dataISO)}
                className="flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-medium text-brand-600 transition-colors hover:bg-brand-50"
              >
                <Plus className="h-3 w-3" /> Agendar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
