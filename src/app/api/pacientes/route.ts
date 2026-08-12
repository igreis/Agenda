import { NextResponse } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";
import { linhaParaPaciente } from "@/lib/supabase/mapeamento";

export async function GET() {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("pacientes")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  const pacientes = (data || []).map(linhaParaPaciente);
  return NextResponse.json(pacientes);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.nome || !body.telefone) {
    return NextResponse.json(
      { erro: "Nome e telefone são obrigatórios." },
      { status: 400 }
    );
  }

  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("pacientes")
    .insert({
      nome: body.nome,
      telefone: body.telefone,
      email: body.email || "",
      data_nascimento: body.dataNascimento || null,
      observacoes: body.observacoes || "",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  return NextResponse.json(linhaParaPaciente(data), { status: 201 });
}
