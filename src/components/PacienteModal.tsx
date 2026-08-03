"use client";

import { FormEvent, useEffect, useState } from "react";
import Modal from "./Modal";
import { Paciente } from "@/lib/types";
import { Trash2 } from "lucide-react";

const inputClasses =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClasses = "mb-1.5 block text-sm font-medium text-ink-800";

export default function PacienteModal({
  aberto,
  onFechar,
  pacienteEditando,
  onSalvar,
  onExcluir,
}: {
  aberto: boolean;
  onFechar: () => void;
  pacienteEditando?: Paciente | null;
  onSalvar: (dados: Partial<Paciente>) => Promise<void>;
  onExcluir?: (id: string) => Promise<void>;
}) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    if (pacienteEditando) {
      setNome(pacienteEditando.nome);
      setTelefone(pacienteEditando.telefone);
      setEmail(pacienteEditando.email ?? "");
      setDataNascimento(pacienteEditando.dataNascimento ?? "");
      setObservacoes(pacienteEditando.observacoes ?? "");
    } else {
      setNome("");
      setTelefone("");
      setEmail("");
      setDataNascimento("");
      setObservacoes("");
    }
    setErro("");
  }, [aberto, pacienteEditando]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nome || !telefone) {
      setErro("Nome e telefone são obrigatórios.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      await onSalvar({ nome, telefone, email, dataNascimento, observacoes });
      onFechar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar paciente.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir() {
    if (!pacienteEditando || !onExcluir) return;
    if (
      !confirm(
        `Excluir ${pacienteEditando.nome}? As consultas desse paciente também serão removidas.`
      )
    )
      return;
    setSalvando(true);
    try {
      await onExcluir(pacienteEditando.id);
      onFechar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao excluir paciente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={pacienteEditando ? "Editar paciente" : "Novo paciente"}
      subtitulo={pacienteEditando ? undefined : "Cadastre os dados do paciente."}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClasses}>Nome completo</label>
          <input
            className={inputClasses}
            placeholder="Ex.: Ana Silva"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClasses}>Telefone / WhatsApp</label>
            <input
              className={inputClasses}
              placeholder="(34) 99999-0000"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClasses}>Data de nascimento</label>
            <input
              type="date"
              className={inputClasses}
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>E-mail (opcional)</label>
          <input
            type="email"
            className={inputClasses}
            placeholder="paciente@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClasses}>Observações (opcional)</label>
          <textarea
            className={`${inputClasses} min-h-[72px] resize-none`}
            placeholder="Alergias, condições de saúde, preferências de horário..."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </div>

        {erro && <p className="text-sm text-rose-600">{erro}</p>}

        <div className="flex items-center justify-between pt-2">
          <div>
            {pacienteEditando && onExcluir && (
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
              disabled={salvando}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              {salvando ? "Salvando..." : pacienteEditando ? "Salvar alterações" : "Cadastrar paciente"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
