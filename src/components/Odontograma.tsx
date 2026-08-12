"use client";

import { useState } from "react";
import { Odontogram as OdontogramBase, ToothConditionGroup, ToothDetail } from "react-odontogram";

export type EstadoDente =
  | "cariado"
  | "restaurado"
  | "canal"
  | "extraido"
  | "implante"
  | "fraturado";

export type MapaDentes = Record<number, EstadoDente>;

const ESTADOS: { id: EstadoDente; label: string; cor: string; fundo: string }[] = [
  { id: "cariado", label: "Cariado", cor: "#d97706", fundo: "#fef3c7" },
  { id: "restaurado", label: "Restaurado", cor: "#16a34a", fundo: "#dcfce7" },
  { id: "canal", label: "Canal", cor: "#9333ea", fundo: "#f3e8ff" },
  { id: "implante", label: "Implante", cor: "#2563eb", fundo: "#dbeafe" },
  { id: "fraturado", label: "Fraturado", cor: "#dc2626", fundo: "#fee2e2" },
  { id: "extraido", label: "Extraído", cor: "#64748b", fundo: "#e2e8f0" },
];

export default function Odontograma({
  valor,
  onChange,
  somenteLeitura = false,
}: {
  valor: MapaDentes;
  onChange?: (novoMapa: MapaDentes) => void;
  somenteLeitura?: boolean;
}) {
  const [resetKey, setResetKey] = useState(0);
  const [denteAtivo, setDenteAtivo] = useState<ToothDetail | null>(null);

  function aoSelecionar(selecionados: ToothDetail[]) {
    setDenteAtivo(selecionados[0] ?? null);
  }

  function aplicarCondicao(estado: EstadoDente) {
    if (!denteAtivo || !onChange) return;
    const fdi = Number(denteAtivo.notations.fdi);
    onChange({ ...valor, [fdi]: estado });
    setDenteAtivo(null);
    setResetKey((k) => k + 1);
  }

  function limparCondicao() {
    if (!denteAtivo || !onChange) return;
    const fdi = Number(denteAtivo.notations.fdi);
    const copia = { ...valor };
    delete copia[fdi];
    onChange(copia);
    setDenteAtivo(null);
    setResetKey((k) => k + 1);
  }

  const grupos: ToothConditionGroup[] = ESTADOS.map((e) => ({
    label: e.label,
    teeth: Object.entries(valor)
      .filter(([, estado]) => estado === e.id)
      .map(([fdi]) => `teeth-${fdi}`),
    outlineColor: e.cor,
    fillColor: e.fundo,
  })).filter((g) => g.teeth.length > 0);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <p className="mb-3 text-sm font-medium text-ink-800">
        {somenteLeitura
          ? "Condições registradas neste atendimento:"
          : "Clique em um dente para marcar a condição do atendimento:"}
      </p>

      <OdontogramBase
        key={resetKey}
        notation="FDI"
        layout="square"
        singleSelect
        onChange={aoSelecionar}
        readOnly={somenteLeitura}
        teethConditions={grupos}
        colors={{ darkBlue: "#175f5b", baseBlue: "#94a3b8", lightBlue: "#d3f2ec" }}
      />

      {!somenteLeitura && denteAtivo && (
        <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50/60 p-3">
          <p className="mb-2 text-sm font-semibold text-ink-900">
            Dente {denteAtivo.notations.fdi} ({denteAtivo.type}) — qual a condição?
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {ESTADOS.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => aplicarCondicao(e.id)}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-brand-300"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full border border-slate-300"
                  style={{ backgroundColor: e.fundo }}
                />
                {e.label}
              </button>
            ))}
            <button
              type="button"
              onClick={limparCondicao}
              className="px-2 text-xs font-medium text-slate-400 underline hover:text-slate-600"
            >
              limpar / cancelar
            </button>
          </div>
        </div>
      )}

      {grupos.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-3">
          {grupos.map((g) => (
            <span key={g.label} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span
                className="h-2.5 w-2.5 rounded-full border"
                style={{ backgroundColor: g.fillColor, borderColor: g.outlineColor }}
              />
              {g.label} ({g.teeth.length})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
