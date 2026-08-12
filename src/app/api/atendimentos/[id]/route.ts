import { NextResponse } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await criarClienteServidor();

  const { error } = await supabase.from("atendimentos").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

