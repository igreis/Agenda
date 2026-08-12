"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone, Pencil } from "lucide-react";
import { useAtendimentos, usePacientes } from "@/lib/hooks";
import { capitalizar, formatarDataLonga } from "@/lib/utils";
import Odontograma, { MapaDentes } from "@/components/Odontograma";
import PacienteModal from "@/components/PacienteModal";
import { Paciente } from "@/lib/types";

export default function PacientePerfilPage() {
  const params = useParams();
  const id = params.id as string;
  const { pacientes, carregando, atualizarPaciente, removerPaciente } = usePacientes();
  const { atendimentos, carregando: carregandoAtendimentos } = useAtendimentos(id);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvandoOdontograma, setSalvandoOdontograma] = useState(false);

  const paciente = pacientes.find((p) => p.id === id);

  const historico = useMemo(
    () =>
      atendimentos
        .sort((a, b) => `${b.data}${b.criadoEm}`.localeCompare(`${a.data}${a.criadoEm}`)),
    [atendimentos]
  );


  async function handleOdontogramaChange(novoMapa: MapaDentes) {
    if (!paciente) return;
    setSalvandoOdontograma(true);
    try {
      await atualizarPaciente(paciente.id, { odontogramaAtual: novoMapa });
    } finally {
      setSalvandoOdontograma(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <p className="text-sm text-slate-500">Carregando...</p>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="min-h-screen bg-canvas px-8 py-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm text-slate-500">Paciente não encontrado.</p>
          <Link href="/pacientes" className="mt-3 inline-block text-sm font-semibold text-brand-600">
            ← Voltar para pacientes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas px-8 py-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/pacientes"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Pacientes
        </Link>

        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[26px] font-extrabold tracking-tight text-ink-900">
              {paciente.nome}
            </h1>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <Phone className="h-3.5 w-3.5" />
                {paciente.telefone}
              </div>
              {paciente.email && (
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Mail className="h-3.5 w-3.5" />
                  {paciente.email}
                </div>
              )}
            </div>
            {paciente.observacoes && (
              <p className="mt-3 text-sm text-slate-600">{paciente.observacoes}</p>
            )}
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 shadow-card transition-colors hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4" />
            Editar dados
          </button>
        </header>

        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ink-900">Odontograma</h2>
            {salvandoOdontograma && (
              <span className="text-xs text-slate-400">Salvando...</span>
            )}
          </div>
          <Odontograma
            valor={paciente.odontogramaAtual ?? {}}
            onChange={handleOdontogramaChange}
          />
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="mb-4 font-display text-base font-bold text-ink-900">
            Histórico de atendimentos
          </h2>

          {carregandoAtendimentos ? (
            <p className="text-sm text-slate-500">Carregando histórico...</p>
          ) : historico.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhum atendimento registrado ainda. Registre um atendimento a partir da agenda ou
              do painel.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {historico.map((a) => (
                <li key={a.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">
                        {capitalizar(formatarDataLonga(a.data))}
                      </p>
                      <p className="mt-0.5 text-sm text-brand-700">{a.procedimentoRealizado}</p>
                    </div>
                    {a.odontograma && Object.keys(a.odontograma).length > 0 && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                        Dentes alterados: {Object.keys(a.odontograma).join(", ")}
                      </span>
                    )}
                  </div>
                  {a.observacoes && (
                    <p className="mt-2 text-sm text-slate-600">{a.observacoes}</p>
                  )}
                  {a.proximoPasso && (
                    <p className="mt-1.5 text-sm text-slate-500">
                      <span className="font-medium text-ink-800">Próximo passo:</span>{" "}
                      {a.proximoPasso}
                    </p>
                  )}
                  {a.odontograma && Object.keys(a.odontograma).length > 0 && (
                    <div className="mt-3">
                      <Odontograma valor={a.odontograma as MapaDentes} somenteLeitura />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <PacienteModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        pacienteEditando={paciente}
        onSalvar={async (dados) => {
          await atualizarPaciente(paciente.id, dados);
        }}
        onExcluir={async (pacienteId) => {
          await removerPaciente(pacienteId);
          window.location.href = "/pacientes";
        }}
      />
    </div>
  );
}
