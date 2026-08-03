import { NextResponse } from "next/server";
import { lerBanco, salvarBanco } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const banco = await lerBanco();

  const idx = banco.consultas.findIndex((c) => c.id === params.id);
  if (idx === -1) {
    return NextResponse.json(
      { erro: "Consulta não encontrada." },
      { status: 404 }
    );
  }

  let pacienteNome = banco.consultas[idx].pacienteNome;
  if (body.pacienteId && body.pacienteId !== banco.consultas[idx].pacienteId) {
    const paciente = banco.pacientes.find((p) => p.id === body.pacienteId);
    if (paciente) pacienteNome = paciente.nome;
  }

  banco.consultas[idx] = {
    ...banco.consultas[idx],
    pacienteId: body.pacienteId ?? banco.consultas[idx].pacienteId,
    pacienteNome,
    data: body.data ?? banco.consultas[idx].data,
    horaInicio: body.horaInicio ?? banco.consultas[idx].horaInicio,
    duracaoMin: body.duracaoMin ? Number(body.duracaoMin) : banco.consultas[idx].duracaoMin,
    procedimento: body.procedimento ?? banco.consultas[idx].procedimento,
    status: body.status ?? banco.consultas[idx].status,
    observacoes: body.observacoes ?? banco.consultas[idx].observacoes,
    dentes: Array.isArray(body.dentes) ? body.dentes : banco.consultas[idx].dentes ?? [],
  };

  await salvarBanco(banco);
  return NextResponse.json(banco.consultas[idx]);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const banco = await lerBanco();

  const existe = banco.consultas.some((c) => c.id === params.id);
  if (!existe) {
    return NextResponse.json(
      { erro: "Consulta não encontrada." },
      { status: 404 }
    );
  }

  banco.consultas = banco.consultas.filter((c) => c.id !== params.id);
  await salvarBanco(banco);

  return NextResponse.json({ ok: true });
}
