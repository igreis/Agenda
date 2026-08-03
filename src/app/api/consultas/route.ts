import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { lerBanco, salvarBanco } from "@/lib/db";
import { Consulta } from "@/lib/types";

export async function GET() {
  const banco = await lerBanco();
  const ordenadas = [...banco.consultas].sort((a, b) => {
    const chaveA = `${a.data} ${a.horaInicio}`;
    const chaveB = `${b.data} ${b.horaInicio}`;
    return chaveA.localeCompare(chaveB);
  });
  return NextResponse.json(ordenadas);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.pacienteId || !body.data || !body.horaInicio || !body.procedimento) {
    return NextResponse.json(
      { erro: "Paciente, data, horário e procedimento são obrigatórios." },
      { status: 400 }
    );
  }

  const banco = await lerBanco();
  const paciente = banco.pacientes.find((p) => p.id === body.pacienteId);

  if (!paciente) {
    return NextResponse.json(
      { erro: "Paciente não encontrado." },
      { status: 404 }
    );
  }

  const nova: Consulta = {
    id: randomUUID(),
    pacienteId: paciente.id,
    pacienteNome: paciente.nome,
    data: body.data,
    horaInicio: body.horaInicio,
    duracaoMin: Number(body.duracaoMin) || 60,
    procedimento: body.procedimento,
    status: body.status ?? "agendado",
    observacoes: body.observacoes ?? "",
    dentes: Array.isArray(body.dentes) ? body.dentes : [],
    criadoEm: new Date().toISOString(),
  };

  banco.consultas.push(nova);
  await salvarBanco(banco);

  return NextResponse.json(nova, { status: 201 });
}
