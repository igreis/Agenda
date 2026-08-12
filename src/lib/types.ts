import { MapaDentes } from "@/components/Odontograma";

export type StatusConsulta =
  | "agendado"
  | "confirmado"
  | "concluido"
  | "cancelado";

export interface Paciente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  dataNascimento?: string; // yyyy-MM-dd
  observacoes?: string;
  odontogramaAtual?: MapaDentes;
  criadoEm: string;
}

export interface Consulta {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  data: string; // yyyy-MM-dd
  horaInicio: string; // HH:mm
  duracaoMin: number;
  procedimento: string;
  status: StatusConsulta;
  observacoes?: string;
  dentes?: number[]; // dentes (FDI) relacionados a esta consulta — opcional
  criadoEm: string;
}

export interface Atendimento {
  id: string;
  consultaId: string;
  pacienteId: string;
  data: string; // yyyy-MM-dd
  procedimentoRealizado: string;
  observacoes?: string;
  proximoPasso?: string;
  odontograma: Record<number, string>; // usa o mesmo formato de MapaDentes
  criadoEm: string;
}

export interface Banco {
  pacientes: Paciente[];
  consultas: Consulta[];
  atendimentos: Atendimento[];
}
