"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Consulta } from "@/lib/types";
import { statusInfo } from "../StatusBadge";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function MonthView({
  mesReferencia,
  consultas,
  diaSelecionado,
  onSelecionarDia,
}: {
  mesReferencia: Date;
  consultas: Consulta[];
  diaSelecionado: string;
  onSelecionarDia: (dataISO: string) => void;
}) {
  const inicioGrade = startOfWeek(startOfMonth(mesReferencia));
  const fimGrade = endOfWeek(endOfMonth(mesReferencia));
  const dias = eachDayOfInterval({ start: inicioGrade, end: fimGrade });

  const porDia = new Map<string, Consulta[]>();
  for (const c of consultas) {
    if (!porDia.has(c.data)) porDia.set(c.data, []);
    porDia.get(c.data)!.push(c);
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/60">
        {DIAS_SEMANA.map((d) => (
          <div
            key={d}
            className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-400"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {dias.map((dia) => {
          const dataISO = format(dia, "yyyy-MM-dd");
          const doMes = isSameMonth(dia, mesReferencia);
          const eHoje = isToday(dia);
          const selecionado = dataISO === diaSelecionado;
          const eventos = (porDia.get(dataISO) ?? []).sort((a, b) =>
            a.horaInicio.localeCompare(b.horaInicio)
          );

          return (
            <button
              key={dataISO}
              onClick={() => onSelecionarDia(dataISO)}
              className={`flex min-h-[104px] flex-col items-stretch gap-1 border-b border-r border-slate-100 p-2 text-left transition-colors last:border-r-0 hover:bg-brand-50/40 ${
                !doMes ? "bg-slate-50/40" : "bg-white"
              } ${selecionado ? "ring-2 ring-inset ring-brand-400" : ""}`}
            >
              <span
                className={`mb-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  eHoje
                    ? "bg-brand-600 text-white"
                    : doMes
                    ? "text-ink-800"
                    : "text-slate-300"
                }`}
              >
                {format(dia, "d")}
              </span>
              <div className="flex flex-col gap-1">
                {eventos.slice(0, 2).map((ev) => (
                  <span
                    key={ev.id}
                    className={`truncate rounded px-1.5 py-0.5 text-[11px] font-medium ${statusInfo[ev.status].classes}`}
                  >
                    {ev.horaInicio} {ev.pacienteNome}
                  </span>
                ))}
                {eventos.length > 2 && (
                  <span className="px-1.5 text-[11px] font-medium text-slate-400">
                    +{eventos.length - 2} mais
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
