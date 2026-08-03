"use client";

import { FormEvent, useEffect, useState } from "react";
import Modal from "./Modal";
import { Consulta, Paciente, StatusConsulta } from "@/lib/types";
import { Trash2, ChevronDown } from "lucide-react";
import SeletorDenteConsulta from "./SeletorDenteConsulta";

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

const DURACOES = [30, 45, 60, 90, 120, 150];

const inputClasses =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClasses = "mb-1.5 block text-sm font-medium text-ink-800";

export default function ConsultaModal({
  aberto,
  onFechar,
  pacientes,
  consultaEditando,
  dataInicial,
  onSalvar,
  onExcluir,
}: {
  aberto: boolean;
  onFechar: () => void;
  pacientes: Paciente[];
  consultaEditando?: Consulta | null;
  dataInicial?: string;
  onSalvar: (dados: Partial<Consulta>) => Promise<void>;
  onExcluir?: (id: string) => Promise<void>;
}) {
  const [pacienteId, setPacienteId] = useState("");
  const [data, setData] = useState("");
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [duracaoMin, setDuracaoMin] = useState(60);
  const [procedimento, setProcedimento] = useState("");
  const [status, setStatus] = useState<StatusConsulta>("agendado");
  const [observacoes, setObservacoes] = useState("");
  const [dentes, setDentes] = useState<number[]>([]);
  const [mostrarDentes, setMostrarDentes] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    if (consultaEditando) {
      setPacienteId(consultaEditando.pacienteId);
      setData(consultaEditando.data);
      setHoraInicio(consultaEditando.horaInicio);
      setDuracaoMin(consultaEditando.duracaoMin);
      setProcedimento(consultaEditando.procedimento);
      setStatus(consultaEditando.status);
      setObservacoes(consultaEditando.observacoes ?? "");
      setDentes(consultaEditando.dentes ?? []);
      setMostrarDentes((consultaEditando.dentes ?? []).length > 0);
    } else {
      setPacienteId(pacientes[0]?.id ?? "");
      setData(dataInicial ?? "");
      setHoraInicio("09:00");
      setDuracaoMin(60);
      setProcedimento("");
      setStatus("agendado");
      setObservacoes("");
      setDentes([]);
      setMostrarDentes(false);
    }
    setErro("");
  }, [aberto, consultaEditando, dataInicial, pacientes]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!pacienteId || !data || !horaInicio || !procedimento) {
      setErro("Preencha paciente, data, horário e procedimento.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      await onSalvar({
        pacienteId,
        data,
        horaInicio,
        duracaoMin,
        procedimento,
        status,
        observacoes,
        dentes,
      });
      onFechar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar consulta.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir() {
    if (!consultaEditando || !onExcluir) return;
    if (!confirm("Excluir esta consulta? Essa ação não pode ser desfeita.")) return;
    setSalvando(true);
    try {
      await onExcluir(consultaEditando.id);
      onFechar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao excluir consulta.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={consultaEditando ? "Editar consulta" : "Nova consulta"}
      subtitulo={consultaEditando ? undefined : "Preencha os dados para agendar."}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {pacientes.length === 0 ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
            Cadastre um paciente primeiro na aba{" "}
            <span className="font-semibold">Pacientes</span> para poder agendar.
          </p>
        ) : (
          <div>
            <label className={labelClasses}>Paciente</label>
            <select
              className={inputClasses}
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
            >
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClasses}>Data</label>
            <input
              type="date"
              className={inputClasses}
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClasses}>Horário</label>
            <input
              type="time"
              className={inputClasses}
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClasses}>Duração</label>
            <select
              className={inputClasses}
              value={duracaoMin}
              onChange={(e) => setDuracaoMin(Number(e.target.value))}
            >
              {DURACOES.map((d) => (
                <option key={d} value={d}>
                  {d} min
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClasses}>Status</label>
            <select
              className={inputClasses}
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusConsulta)}
            >
              <option value="agendado">Agendado</option>
              <option value="confirmado">Confirmado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClasses}>Procedimento</label>
          <input
            list="procedimentos-sugeridos"
            className={inputClasses}
            placeholder="Ex.: Limpeza e profilaxia"
            value={procedimento}
            onChange={(e) => setProcedimento(e.target.value)}
          />
          <datalist id="procedimentos-sugeridos">
            {PROCEDIMENTOS_SUGERIDOS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>

        <div>
          <label className={labelClasses}>Observações (opcional)</label>
          <textarea
            className={`${inputClasses} min-h-[72px] resize-none`}
            placeholder="Detalhes relevantes para o atendimento"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setMostrarDentes((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${mostrarDentes ? "rotate-180" : ""}`}
            />
            Selecionar dente (opcional)
          </button>
          {mostrarDentes && (
            <div className="mt-2">
              <SeletorDenteConsulta key={consultaEditando?.id ?? "nova"} valor={dentes} onChange={setDentes} />
            </div>
          )}
        </div>

        {erro && <p className="text-sm text-rose-600">{erro}</p>}

        <div className="flex items-center justify-between pt-2">
          <div>
            {consultaEditando && onExcluir && (
              <button
                type="button"
                onClick={handleExcluir}
                disabled={salvando}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onFechar}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando || pacientes.length === 0}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              {salvando ? "Salvando..." : consultaEditando ? "Salvar alterações" : "Agendar consulta"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
