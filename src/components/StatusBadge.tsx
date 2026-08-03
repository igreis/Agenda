import { StatusConsulta } from "@/lib/types";

export const statusInfo: Record<
  StatusConsulta,
  { label: string; dot: string; classes: string }
> = {
  agendado: {
    label: "Agendado",
    dot: "bg-blue-500",
    classes: "bg-blue-50 text-blue-700",
  },
  confirmado: {
    label: "Confirmado",
    dot: "bg-emerald-500",
    classes: "bg-emerald-50 text-emerald-700",
  },
  concluido: {
    label: "Concluído",
    dot: "bg-slate-400",
    classes: "bg-slate-100 text-slate-600",
  },
  cancelado: {
    label: "Cancelado",
    dot: "bg-rose-500",
    classes: "bg-rose-50 text-rose-700",
  },
};

export default function StatusBadge({ status }: { status: StatusConsulta }) {
  const info = statusInfo[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${info.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${info.dot}`} />
      {info.label}
    </span>
  );
}
