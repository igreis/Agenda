import { NextResponse } from "next/server";
import { lerBanco, salvarBanco } from "@/lib/db";
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const banco = await lerBanco();

  const idx = banco.atendimentos.findIndex((a) => a.id === params.id);
  if (idx === -1) {
    return NextResponse.json({ erro: "Atendimento não encontrado." }, { status: 404 });
  }

  const pacienteIdx = banco.pacientes.findIndex(
    (p) => p.id === banco.atendimentos[idx].pacienteId
  );

  let odontogramaAlteracoes = banco.atendimentos[idx].odontograma;

  if (body.odontogramaCompleto && pacienteIdx !== -1) {
    const anterior = banco.pacientes[pacienteIdx].odontogramaAtual ?? {};
    odontogramaAlteracoes = calcularAlteracoes(anterior, body.odontogramaCompleto);
    banco.pacientes[pacienteIdx].odontogramaAtual = { ...body.odontogramaCompleto };
  }

  banco.atendimentos[idx] = {
    ...banco.atendimentos[idx],
    procedimentoRealizado:
      body.procedimentoRealizado ?? banco.atendimentos[idx].procedimentoRealizado,
    observacoes: body.observacoes ?? banco.atendimentos[idx].observacoes,
    proximoPasso: body.proximoPasso ?? banco.atendimentos[idx].proximoPasso,
    odontograma: odontogramaAlteracoes,
    anexos: Array.isArray(body.anexos) ? body.anexos : banco.atendimentos[idx].anexos,
  };

  await salvarBanco(banco);
  return NextResponse.json(banco.atendimentos[idx]);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const banco = await lerBanco();

  const existe = banco.atendimentos.some((a) => a.id === params.id);
  if (!existe) {
    return NextResponse.json({ erro: "Atendimento não encontrado." }, { status: 404 });
  }

  banco.atendimentos = banco.atendimentos.filter((a) => a.id !== params.id);
  await salvarBanco(banco);

  return NextResponse.json({ ok: true });
}
