import { NextResponse } from "next/server";
import { lerBanco, salvarBanco } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const banco = await lerBanco();

  const idx = banco.pacientes.findIndex((p) => p.id === params.id);
  if (idx === -1) {
    return NextResponse.json(
      { erro: "Paciente não encontrado." },
      { status: 404 }
    );
  }

  banco.pacientes[idx] = {
    ...banco.pacientes[idx],
    nome: body.nome ?? banco.pacientes[idx].nome,
    telefone: body.telefone ?? banco.pacientes[idx].telefone,
    email: body.email ?? banco.pacientes[idx].email,
    dataNascimento: body.dataNascimento ?? banco.pacientes[idx].dataNascimento,
    observacoes: body.observacoes ?? banco.pacientes[idx].observacoes,
    odontogramaAtual:
      body.odontogramaAtual !== undefined
        ? body.odontogramaAtual
        : banco.pacientes[idx].odontogramaAtual,
  };

  // mantém o nome do paciente sincronizado nas consultas existentes
  banco.consultas = banco.consultas.map((c) =>
    c.pacienteId === params.id
      ? { ...c, pacienteNome: banco.pacientes[idx].nome }
      : c
  );

  await salvarBanco(banco);
  return NextResponse.json(banco.pacientes[idx]);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const banco = await lerBanco();

  const existe = banco.pacientes.some((p) => p.id === params.id);
  if (!existe) {
    return NextResponse.json(
      { erro: "Paciente não encontrado." },
      { status: 404 }
    );
  }

  banco.pacientes = banco.pacientes.filter((p) => p.id !== params.id);
  banco.consultas = banco.consultas.filter((c) => c.pacienteId !== params.id);
  banco.atendimentos = banco.atendimentos.filter((a) => a.pacienteId !== params.id);

  await salvarBanco(banco);
  return NextResponse.json({ ok: true });
}
