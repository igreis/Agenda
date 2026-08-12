import { NextResponse } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";
import { linhaParaConsulta } from "@/lib/supabase/mapeamento";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const supabase = await criarClienteServidor();

  const updateData: Record<string, any> = {};

  if (body.pacienteId) {
    const { data: paciente, error: pacError } = await supabase
      .from("pacientes")
      .select("id, nome")
      .eq("id", body.pacienteId)
      .single();

    if (pacError || !paciente) {
      return NextResponse.json(
        { erro: "Paciente não encontrado." },
        { status: 404 }
      );
    }
    updateData.paciente_id = paciente.id;
    updateData.paciente_nome = paciente.nome;
  }

  if (body.data !== undefined) updateData.data = body.data;
  if (body.horaInicio !== undefined) updateData.hora_inicio = body.horaInicio;
  if (body.duracaoMin !== undefined) updateData.duracao_min = Number(body.duracaoMin);
  if (body.procedimento !== undefined) updateData.procedimento = body.procedimento;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.observacoes !== undefined) updateData.observacoes = body.observacoes;
  if (body.dentes !== undefined && Array.isArray(body.dentes)) {
    updateData.dentes = body.dentes;
  }

  const { data, error } = await supabase
    .from("consultas")
    .update(updateData)
    .eq("id", params.id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { erro: error?.message || "Consulta não encontrada." },
      { status: error ? 500 : 404 }
    );
  }

  return NextResponse.json(linhaParaConsulta(data));
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("consultas")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
