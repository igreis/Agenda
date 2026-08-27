export interface EnviarLembreteWhatsappParams {
  telefone: string;
  nome: string;
  dataFormatada: string; // "dd/MM"
  horario: string; // "HH:mm"
  procedimento: string;
  consultaId: string;
}

function normalizarTelefoneE164(telefone: string): string {
  // Remover todos os caracteres não numéricos
  const apenasNumeros = telefone.replace(/\D/g, "");

  // Se já começa com 55 (código do Brasil), retornar como está
  if (apenasNumeros.startsWith("55")) {
    return apenasNumeros;
  }

  // Se tem 10 ou 11 dígitos (DDD + número), adicionar 55
  if (apenasNumeros.length === 10 || apenasNumeros.length === 11) {
    return `55${apenasNumeros}`;
  }

  // Se já tem mais de 11 dígitos, assumir que já está no formato correto
  return apenasNumeros;
}

export async function enviarLembreteWhatsapp(params: EnviarLembreteWhatsappParams): Promise<void> {
  const telefoneE164 = normalizarTelefoneE164(params.telefone);

  const url = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: telefoneE164,
    type: "template",
    template: {
      name: process.env.WHATSAPP_TEMPLATE_NAME,
      language: {
        code: "pt_BR",
      },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: params.nome },
            { type: "text", text: params.dataFormatada },
            { type: "text", text: params.horario },
            { type: "text", text: params.procedimento },
          ],
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: 0,
          parameters: [
            { type: "payload", payload: `confirmar:${params.consultaId}` },
          ],
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: 1,
          parameters: [
            { type: "payload", payload: `cancelar:${params.consultaId}` },
          ],
        },
      ],
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `Erro HTTP ${response.status}`;
    throw new Error(`Falha ao enviar WhatsApp: ${errorMessage}`);
  }
}
