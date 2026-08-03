import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function hojeISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatarDataLonga(dataISO: string): string {
  return format(parseISO(dataISO), "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function formatarDataCurta(dataISO: string): string {
  return format(parseISO(dataISO), "d MMM", { locale: ptBR });
}

export function formatarDiaSemanaCurto(dataISO: string): string {
  return format(parseISO(dataISO), "EEE", { locale: ptBR });
}

export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function horaParaMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function minutosParaHora(minutos: number): string {
  const h = Math.floor(minutos / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutos % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export function podeRegistrarAtendimento(consulta: { data: string; status: string }): boolean {
  const hoje = hojeISO();
  return consulta.data <= hoje && consulta.status !== "concluido" && consulta.status !== "cancelado";
}
