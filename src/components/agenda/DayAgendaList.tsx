"use client";

import { CalendarPlus, ClipboardPlus, Clock, Pencil } from "lucide-react";
import { Consulta } from "@/lib/types";
import { capitalizar, formatarDataLonga, iniciais, podeRegistrarAtendimento } from "@/lib/utils";
import StatusBadge from "../StatusBadge";

export default function DayAgendaList({
  dataISO,
  consultas,
  onSelecionarConsulta,
  onNovaConsulta,
  onRegistrarAtendimento,
  titulo,
}: {
  dataISO: string;
  consultas: Consulta[];
  onSelecionarConsulta: (c: Consulta) => void;
  onNovaConsulta: (dataISO: string) => void;
  onRegistrarAtendimento?: (c: Consulta) => void;
  titulo?: string;
}) {
  const eventos = consultas
    .filter((c) => c.data === dataISO)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-bold text-ink-900">
            {titulo ?? capitalizar(formatarDataLonga(dataISO))}
          </h3>
          <p className="text-sm text-slate-500">
            {eventos.length} {eventos.length === 1 ? "consulta" : "consultas"}
          </p>
        </div>
        <button
          onClick={() => onNovaConsulta(dataISO)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
        >
          <CalendarPlus className="h-4 w-4" />
          Agendar
        </button>
      </div>

      {eventos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <Clock className="h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">Nenhuma consulta neste dia.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {eventos.map((ev) => (
            <li key={ev.id} className="-mx-2 flex flex-col  gap-2 rounded-lg px-2 py-3 hover:bg-slate-50">
              <button
                onClick={() => onSelecionarConsulta(ev)}
                className="flex min-w-0 flex-1 items-center gap-4 text-left"
              >
                <div className="w-14 shrink-0">
                  <p className="text-sm font-semibold text-ink-900">{ev.horaInicio}</p>
                  <p className="text-xs text-slate-400">{ev.duracaoMin}min</p>
                </div>
               
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{ev.pacienteNome}</p>
                  <p className="truncate text-sm text-slate-500">{ev.procedimento}</p>
                </div>
              
                
              </button>
              <div className="flex items-center gap-2">
              <StatusBadge status={ev.status} />
              <div className="flex shrink-0 gap-1">
                {onRegistrarAtendimento && podeRegistrarAtendimento(ev) && (
                  <button
                    onClick={() => onRegistrarAtendimento(ev)}
                    title="Registrar atendimento"
                    className="grid h-8 w-8 place-items-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-50"
                  >
                    <ClipboardPlus className="h-4 w-4" />
                    
                  </button>
                )}
                <button
                  onClick={() => onSelecionarConsulta(ev)}
                  title="Editar consulta"
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-600"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  
                </button>
              </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
