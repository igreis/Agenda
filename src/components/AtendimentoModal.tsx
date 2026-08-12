"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import Odontograma, { MapaDentes } from "./Odontograma";
import { Consulta, Paciente } from "@/lib/types";
import { useAtendimentos } from "@/lib/hooks";

const PROCEDIMENTOS_SUGERIDOS = [
  "Avaliação inicial",
  "Limpeza e profilaxia",
  "Restauração",
  "Canal",
  "Extração",
  "Clareamento dental",
  "Aparelho ortodôntico",
  "Retorno",
];

const inputClasses =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClasses = "mb-1.5 block text-sm font-medium text-ink-800";

export default function AtendimentoModal({
  aberto,
  onFechar,
  consulta,
  paciente,
  onSalvo,
  onSalvar,
}: {
  aberto: boolean;
  onFechar: () => void;
  consulta: Consulta | null;
  paciente: Paciente | null;
  onSalvo?: () => void | Promise<void>;
  onSalvar?: (dados: any) => Promise<void>;
}) {
  const { criarAtendimento } = useAtendimentos();
  const [procedimentoRealizado, setProcedimentoRealizado] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [proximoPasso, setProximoPasso] = useState("");
  const [odontogramaEditavel, setOdontogramaEditavel] = useState<MapaDentes>({});
  const [mostrarOdontograma, setMostrarOdontograma] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const odontogramaOriginalRef = useRef<MapaDentes>({});

  useEffect(() => {
    if (!aberto || !consulta) return;
    setProcedimentoRealizado(consulta.procedimento || "");
    setObservacoes("");
    setProximoPasso("");
    const mapaAtual = (paciente?.odontogramaAtual as MapaDentes) ?? {};
    odontogramaOriginalRef.current = { ...mapaAtual };
    setOdontogramaEditavel({ ...mapaAtual });
    setMostrarOdontograma(false);
    setErro("");
  }, [aberto, consulta, paciente]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!consulta || !paciente) return;
    if (!procedimentoRealizado.trim()) {
      setErro("Informe o procedimento realizado.");
      return;
    }
    setSalvando(true);
    setErro("");

    try {
      // Calcula o delta comparando odontogramaEditavel com o odontogramaOriginal
      const delta: Record<number, string> = {};
      const original = odontogramaOriginalRef.current || {};
      for (const [kStr, val] of Object.entries(odontogramaEditavel)) {
        const k = Number(kStr);
        if (original[k] !== val) {
          delta[k] = val;
        }
      }

      if (onSalvar) {
        await onSalvar({
          consultaId: consulta.id,
          pacienteId: paciente.id,
          data: consulta.data,
          procedimentoRealizado: procedimentoRealizado.trim(),
          observacoes: observacoes.trim() || undefined,
          proximoPasso: proximoPasso.trim() || undefined,
          odontograma: delta,
        });
      } else {
        await criarAtendimento({
          consultaId: consulta.id,
          pacienteId: paciente.id,
          data: consulta.data,
          procedimentoRealizado: procedimentoRealizado.trim(),
          observacoes: observacoes.trim() || undefined,
          proximoPasso: proximoPasso.trim() || undefined,
          odontograma: delta,
        });
      }

      onFechar();
      await onSalvo?.();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao registrar atendimento.");
    } finally {
      setSalvando(false);
    }
  }

  if (!consulta) return null;

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Registrar atendimento"
      subtitulo={`${consulta.pacienteNome} · ${consulta.data} às ${consulta.horaInicio}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClasses}>Procedimento realizado</label>
          <input
            list="procedimentos-atendimento"
            className={inputClasses}
            placeholder="Ex.: Restauração em dente 16"
            value={procedimentoRealizado}
            onChange={(e) => setProcedimentoRealizado(e.target.value)}
          />
          <datalist id="procedimentos-atendimento">
            {PROCEDIMENTOS_SUGERIDOS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>

        <div>
          <label className={labelClasses}>Observações clínicas (opcional)</label>
          <textarea
            className={`${inputClasses} min-h-[72px] resize-none`}
            placeholder="Detalhes do atendimento, materiais usados, reações..."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClasses}>Próximo passo (opcional)</label>
          <input
            className={inputClasses}
            placeholder="Ex.: Retorno em 15 dias para avaliação"
            value={proximoPasso}
            onChange={(e) => setProximoPasso(e.target.value)}
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setMostrarOdontograma((v) => !v)}
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            {mostrarOdontograma ? "− Ocultar odontograma" : "+ Atualizar odontograma (opcional)"}
          </button>
          {mostrarOdontograma && (
            <div className="mt-3">
              <Odontograma valor={odontogramaEditavel} onChange={setOdontogramaEditavel} />
            </div>
          )}
        </div>

        <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800">
          Ao salvar, a consulta será marcada como <strong>concluída</strong> automaticamente.
        </p>

        {erro && <p className="text-sm text-rose-600">{erro}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onFechar}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Registrar atendimento"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
