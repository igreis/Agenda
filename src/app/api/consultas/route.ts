import { NextResponse } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";
import { linhaParaConsulta } from "@/lib/supabase/mapeamento";

export async function GET() {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("consultas")
    .select("*")
    .order("data", { ascending: true })
    .order("hora_inicio", { ascending: true });

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  const consultas = (data || []).map(linhaParaConsulta);
  return NextResponse.json(consultas);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.pacienteId || !body.data || !body.horaInicio || !body.procedimento) {
    return NextResponse.json(
      { erro: "Paciente, data, horário e procedimento são obrigatórios." },
      { status: 400 }
    );
  }

  const supabase = await criarClienteServidor();

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

  const { data, error } = await supabase
    .from("consultas")
    .insert({
      paciente_id: paciente.id,
      paciente_nome: paciente.nome,
      data: body.data,
      hora_inicio: body.horaInicio,
      duracao_min: Number(body.duracaoMin) || 60,
      procedimento: body.procedimento,
      status: body.status ?? "agendado",
      observacoes: body.observacoes ?? "",
      dentes: Array.isArray(body.dentes) ? body.dentes : [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  return NextResponse.json(linhaParaConsulta(data), { status: 201 });
}
