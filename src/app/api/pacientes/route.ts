import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { lerBanco, salvarBanco } from "@/lib/db";
import { Paciente } from "@/lib/types";

export async function GET() {
  const banco = await lerBanco();
  const ordenados = [...banco.pacientes].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );
  return NextResponse.json(ordenados);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.nome || !body.telefone) {
    return NextResponse.json(
      { erro: "Nome e telefone são obrigatórios." },
      { status: 400 }
    );
  }

  const banco = await lerBanco();

  const novo: Paciente = {
    id: randomUUID(),
    nome: body.nome,
    telefone: body.telefone,
    email: body.email ?? "",
    dataNascimento: body.dataNascimento ?? "",
    observacoes: body.observacoes ?? "",
    criadoEm: new Date().toISOString(),
  };

  banco.pacientes.push(novo);
  await salvarBanco(banco);

  return NextResponse.json(novo, { status: 201 });
}
