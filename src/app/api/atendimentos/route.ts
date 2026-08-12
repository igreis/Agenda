import { NextResponse } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";
import { linhaParaAtendimento } from "@/lib/supabase/mapeamento";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pacienteId = searchParams.get("pacienteId");

  const supabase = await criarClienteServidor();
  let query = supabase
    .from("atendimentos")
    .select("*")
    .order("data", { ascending: false })
    .order("criado_em", { ascending: false });

  if (pacienteId) {
    query = query.eq("paciente_id", pacienteId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  const atendimentos = (data || []).map(linhaParaAtendimento);
  return NextResponse.json(atendimentos);
}

export async function POST(request: Request) {
  const body = await request.json();

  const { consultaId, pacienteId, procedimentoRealizado, observacoes, proximoPasso, odontograma, data } = body;

  if (!consultaId || !pacienteId || !procedimentoRealizado) {
    return NextResponse.json(
      { erro: "Consulta, paciente e procedimento realizado são obrigatórios." },
      { status: 400 }
    );
  }

  const supabase = await criarClienteServidor();

  // Valida os vínculos antes de realizar qualquer alteração. Isso evita criar
  // atendimentos órfãos quando um update é bloqueado por uma política RLS.
  const { data: consulta, error: errConsultaGet } = await supabase
    .from("consultas")
    .select("id, paciente_id")
    .eq("id", consultaId)
    .single();

  if (errConsultaGet || !consulta) {
    console.error("[POST /api/atendimentos] Consulta não encontrada:", errConsultaGet);
    return NextResponse.json({ erro: "Consulta não encontrada." }, { status: 404 });
  }

  if (consulta.paciente_id !== pacienteId) {
    console.error("[POST /api/atendimentos] Consulta não pertence ao paciente informado.");
    return NextResponse.json({ erro: "A consulta não pertence ao paciente informado." }, { status: 400 });
  }

  const { data: pacienteDb, error: errPacienteGet } = await supabase
    .from("pacientes")
    .select("odontograma_atual")
    .eq("id", pacienteId)
    .single();

  if (errPacienteGet || !pacienteDb) {
    console.error("[POST /api/atendimentos] Erro ao buscar paciente:", errPacienteGet);
    return NextResponse.json({ erro: "Paciente não encontrado." }, { status: 404 });
  }

  // 1. Update na tabela consultas setando status = "concluido"
  const { data: consultasAtualizadas, error: errConsulta } = await supabase
    .from("consultas")
    .update({ status: "concluido" })
    .eq("id", consultaId)
    .select();

  if (errConsulta) {
    console.error("[POST /api/atendimentos] Erro 2 ao atualizar consulta:", errConsulta);
    return NextResponse.json({ erro: `Erro ao concluir consulta: ${errConsulta.message}` }, { status: 500 });
  }

  if (!consultasAtualizadas || consultasAtualizadas.length === 0) {
    console.error(`[POST /api/atendimentos] RLS bloqueou a atualização da consulta ${consultaId}`);
    return NextResponse.json(
      { erro: "O Supabase bloqueou a atualização da consulta. Configure uma política RLS de UPDATE para consultas." },
      { status: 403 }
    );
  }

  // 2. Mescla e atualiza o odontograma atual do paciente.
  const odontogramaAtualOriginal = typeof pacienteDb?.odontograma_atual === "object" && pacienteDb?.odontograma_atual
    ? pacienteDb.odontograma_atual
    : {};
  const novoOdontogramaAtual = { ...odontogramaAtualOriginal, ...(odontograma || {}) };

  const { data: pacientesAtualizados, error: errPacienteUpdate } = await supabase
    .from("pacientes")
    .update({ odontograma_atual: novoOdontogramaAtual })
    .eq("id", pacienteId)
    .select();

  if (errPacienteUpdate) {
    console.error("[POST /api/atendimentos] Erro 4 ao atualizar paciente:", errPacienteUpdate);
    return NextResponse.json({ erro: `Erro ao atualizar odontograma do paciente: ${errPacienteUpdate.message}` }, { status: 500 });
  }

  if (!pacientesAtualizados || pacientesAtualizados.length === 0) {
    console.error(`[POST /api/atendimentos] RLS bloqueou a atualização do paciente ${pacienteId}`);
    return NextResponse.json(
      { erro: "O Supabase bloqueou a atualização do odontograma. Configure uma política RLS de UPDATE para pacientes." },
      { status: 403 }
    );
  }

  // 3. Só cria o atendimento depois que os dois updates obrigatórios ocorreram.
  const { data: atendimentoCriado, error: errAtendimento } = await supabase
    .from("atendimentos")
    .insert({
      consulta_id: consultaId,
      paciente_id: pacienteId,
      procedimento_realizado: procedimentoRealizado,
      observacoes: observacoes || "",
      proximo_passo: proximoPasso || "",
      odontograma: odontograma || {},
      data: data || new Date().toISOString().split("T")[0],
    })
    .select()
    .single();

  if (errAtendimento) {
    console.error("[POST /api/atendimentos] Erro ao inserir atendimento:", errAtendimento);
    return NextResponse.json({ erro: `Erro ao salvar atendimento: ${errAtendimento.message}` }, { status: 500 });
  }

  return NextResponse.json(linhaParaAtendimento(atendimentoCriado), { status: 201 });
}

