import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Como o WhatsApp ainda não foi configurado, retornamos sucesso indicando que o cron rodou
    // mas não enviou mensagens para evitar falhas.
    return NextResponse.json({
      sucesso: true,
      mensagem: "Cron de lembretes executado. WhatsApp não configurado - nenhuma mensagem enviada.",
    });
  } catch (error) {
    return NextResponse.json(
      { erro: error instanceof Error ? error.message : "Erro desconhecido ao executar cron" },
      { status: 500 }
    );
  }
}
