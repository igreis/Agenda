import { NextRequest, NextResponse } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";
import { enviarLembreteWhatsapp } from "@/lib/whatsapp";
import { format, addDays } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

function getTomorrowInBrazil(): string {
  // Get current time in Brazil timezone (America/Sao_Paulo)
  const now = new Date();
  const brazilTime = utcToZonedTime(now, "America/Sao_Paulo");
  const tomorrow = addDays(brazilTime, 1);
  // Format as yyyy-MM-dd for database query
  return format(tomorrow, "yyyy-MM-dd");
}

function formatDataParaTemplate(data: string): string {
  // data is in yyyy-MM-dd format, convert to dd/MM
  return format(new Date(data), "dd/MM");
}

export async function GET(request: NextRequest) {
  // Verify CRON_SECRET
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expectedAuth) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  try {
    const supabase = await criarClienteServidor();
    const dataAmanha = getTomorrowInBrazil();

    // Buscar consultas de amanhã que não estão canceladas/concluídas e não tiveram lembrete enviado
    const { data: consultas, error } = await supabase
      .from("consultas")
      .select("*")
      .eq("data", dataAmanha)
      .not("status", "in", "('cancelado','concluido')")
      .is("lembrete_enviado_em", null);

    if (error) {
      console.error("Erro ao buscar consultas:", error);
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    if (!consultas || consultas.length === 0) {
      return NextResponse.json({ enviadas: 0, falhas: 0, erros: [] });
    }

    let enviadas = 0;
    const erros: { consultaId: string; erro: string }[] = [];

    for (const consulta of consultas) {
      // Buscar paciente para pegar telefone e nome
      const { data: paciente, error: pacError } = await supabase
        .from("pacientes")
        .select("id, nome, telefone")
        .eq("id", consulta.paciente_id)
        .single();

      if (pacError || !paciente) {
        const erroMsg = `Paciente não encontrado para consulta ${consulta.id}`;
        console.error(erroMsg);
        erros.push({ consultaId: consulta.id, erro: erroMsg });
        continue;
      }

      if (!paciente.telefone) {
        const erroMsg = `Paciente ${paciente.nome} (${paciente.id}) não tem telefone cadastrado`;
        console.error(erroMsg);
        erros.push({ consultaId: consulta.id, erro: erroMsg });
        continue;
      }

      try {
        const dataFormatada = formatDataParaTemplate(consulta.data);
        const horario = consulta.hora_inicio.slice(0, 5); // HH:mm

        await enviarLembreteWhatsapp({
          telefone: paciente.telefone,
          nome: paciente.nome,
          dataFormatada,
          horario,
          procedimento: consulta.procedimento,
          consultaId: consulta.id,
        });

        // Atualizar consulta marcando lembrete como enviado
        const { error: updateError } = await supabase
          .from("consultas")
          .update({ lembrete_enviado_em: new Date().toISOString() })
          .eq("id", consulta.id);

        if (updateError) {
          console.error(`Erro ao atualizar lembrete_enviado_em para ${consulta.id}:`, updateError);
        }

        enviadas++;
      } catch (err) {
        const erroMsg = err instanceof Error ? err.message : "Erro desconhecido";
        console.error(`Falha ao enviar lembrete para consulta ${consulta.id}:`, erroMsg);
        erros.push({ consultaId: consulta.id, erro: erroMsg });
      }
    }

    return NextResponse.json({
      enviadas,
      falhas: erros.length,
      erros,
    });
  } catch (err) {
    console.error("Erro geral no cron de lembretes:", err);
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
