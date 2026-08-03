"use client";

import { Odontogram as OdontogramBase, ToothDetail } from "react-odontogram";

export default function SeletorDenteConsulta({
  valor,
  onChange,
}: {
  valor: number[];
  onChange: (novo: number[]) => void;
}) {
  function aoMudar(selecionados: ToothDetail[]) {
    onChange(selecionados.map((t) => Number(t.notations.fdi)));
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <p className="mb-2 text-xs text-slate-500">
        {valor.length === 0
          ? "Nenhum dente selecionado"
          : `Selecionado: ${[...valor].sort((a, b) => a - b).join(", ")}`}
      </p>
      <OdontogramBase
        notation="FDI"
        layout="square"
        defaultSelected={valor.map((n) => `teeth-${n}`)}
        onChange={aoMudar}
        showTooltip={false}
        colors={{ darkBlue: "#19766f", baseBlue: "#cbd5e1", lightBlue: "#d3f2ec" }}
      />
    </div>
  );
}
