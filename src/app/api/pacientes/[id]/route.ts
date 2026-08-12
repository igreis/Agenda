import { NextResponse } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";
import { linhaParaPaciente } from "@/lib/supabase/mapeamento";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const supabase = await criarClienteServidor();

  const updateData: Record<string, any> = {};
  if (body.nome !== undefined) updateData.nome = body.nome;
  if (body.telefone !== undefined) updateData.telefone = body.telefone;
  if (body.email !== undefined) updateData.email = body.email;
  if (body.dataNascimento !== undefined)
    updateData.data_nascimento = body.dataNascimento || null;
  if (body.observacoes !== undefined)
    updateData.observacoes = body.observacoes;
  if (body.odontogramaAtual !== undefined)
    updateData.odontograma_atual = body.odontogramaAtual;

  const { data, error } = await supabase
    .from("pacientes")
    .update(updateData)
    .eq("id", params.id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { erro: error?.message || "Paciente não encontrado." },
      { status: error ? 500 : 404 }
    );
  }

  if (body.nome) {
    await supabase
      .from("consultas")
      .update({ paciente_nome: body.nome })
      .eq("paciente_id", params.id);
  }

  return NextResponse.json(linhaParaPaciente(data));
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("pacientes")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
