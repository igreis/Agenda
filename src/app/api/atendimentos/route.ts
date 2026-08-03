import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { lerBanco, salvarBanco } from "@/lib/db";
import { Atendimento } from "@/lib/types";
import { MapaDentes } from "@/components/Odontograma";

function calcularAlteracoes(
  anterior: MapaDentes,
  novo: MapaDentes
): MapaDentes | undefined {
  const alteracoes: MapaDentes = {};
  const todasChaves = new Set([
    ...Object.keys(anterior).map(Number),
    ...Object.keys(novo).map(Number),
  ]);

  for (const fdi of todasChaves) {
    if (anterior[fdi] !== novo[fdi]) {
      if (novo[fdi] !== undefined) {
        alteracoes[fdi] = novo[fdi];
      }
    }
  }

  return Object.keys(alteracoes).length > 0 ? alteracoes : undefined;
}

export async function GET() {
  const banco = await lerBanco();
  const ordenados = [...banco.atendimentos].sort((a, b) => {
    const chaveA = `${a.data} ${a.criadoEm}`;
    const chaveB = `${b.data} ${b.criadoEm}`;
    return chaveB.localeCompare(chaveA);
  });
  return NextResponse.json(ordenados);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.consultaId || !body.pacienteId || !body.data || !body.procedimentoRealizado) {
    return NextResponse.json(
      { erro: "Consulta, paciente, data e procedimento realizado são obrigatórios." },
      { status: 400 }
    );
  }

  const banco = await lerBanco();

  const consultaIdx = banco.consultas.findIndex((c) => c.id === body.consultaId);
  if (consultaIdx === -1) {
    return NextResponse.json({ erro: "Consulta não encontrada." }, { status: 404 });
  }

  const pacienteIdx = banco.pacientes.findIndex((p) => p.id === body.pacienteId);
  if (pacienteIdx === -1) {
    return NextResponse.json({ erro: "Paciente não encontrado." }, { status: 404 });
  }

  let odontogramaAlteracoes: MapaDentes | undefined;

  if (body.odontogramaCompleto) {
    const anterior = banco.pacientes[pacienteIdx].odontogramaAtual ?? {};
    odontogramaAlteracoes = calcularAlteracoes(anterior, body.odontogramaCompleto);
    banco.pacientes[pacienteIdx].odontogramaAtual = { ...body.odontogramaCompleto };
  }

  const novo: Atendimento = {
    id: randomUUID(),
    consultaId: body.consultaId,
    pacienteId: body.pacienteId,
    data: body.data,
    procedimentoRealizado: body.procedimentoRealizado,
    observacoes: body.observacoes ?? "",
    proximoPasso: body.proximoPasso ?? "",
    odontograma: odontogramaAlteracoes,
    anexos: Array.isArray(body.anexos) ? body.anexos : [],
    criadoEm: new Date().toISOString(),
  };

  banco.atendimentos.push(novo);
  banco.consultas[consultaIdx].status = "concluido";

  await salvarBanco(banco);

  return NextResponse.json(novo, { status: 201 });
}
