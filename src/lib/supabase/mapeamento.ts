import { Atendimento, Consulta, Paciente } from "@/lib/types";
import { MapaDentes } from "@/components/Odontograma";

function extrairObjetoJson(val: any): MapaDentes {
  if (!val) return {};
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return {};
    }
  }
  if (typeof val === "object") return val as MapaDentes;
  return {};
}

export function linhaParaPaciente(linha: any): Paciente {
  return {
    id: linha.id,
    nome: linha.nome,
    telefone: linha.telefone,
    email: linha.email ?? "",
    dataNascimento: linha.data_nascimento ?? "",
    observacoes: linha.observacoes ?? "",
    odontogramaAtual: extrairObjetoJson(linha.odontograma_atual),
    criadoEm: linha.criado_em,
  };
}

export function linhaParaConsulta(linha: any): Consulta {
  return {
    id: linha.id,
    pacienteId: linha.paciente_id,
    pacienteNome: linha.paciente_nome,
    data: linha.data,
    horaInicio: (linha.hora_inicio ?? "").slice(0, 5),
    duracaoMin: linha.duracao_min,
    procedimento: linha.procedimento,
    status: linha.status,
    observacoes: linha.observacoes ?? "",
    dentes: linha.dentes ?? [],
    criadoEm: linha.criado_em,
  };
}

export function linhaParaAtendimento(linha: any): Atendimento {
  return {
    id: linha.id,
    consultaId: linha.consulta_id,
    pacienteId: linha.paciente_id,
    data: linha.data,
    procedimentoRealizado: linha.procedimento_realizado,
    observacoes: linha.observacoes ?? "",
    proximoPasso: linha.proximo_passo ?? "",
    odontograma: extrairObjetoJson(linha.odontograma),
    criadoEm: linha.criado_em,
  };
}

