Preciso implementar o envio automático de lembrete de consulta via WhatsApp
Business Cloud API (oficial da Meta) neste projeto Next.js + TypeScript +
Supabase. Não é um bot conversacional — é só um envio automático 1x por dia
com uma mensagem de template contendo 2 botões de resposta rápida
("Confirmar presença" / "Não vou poder ir"), e um webhook simples que só
processa o toque nesses botões (nada de menu, nada de fluxo de conversa).

Leia a estrutura atual do projeto antes de mexer em qualquer coisa —
especialmente `src/lib/supabase/server.ts`, `src/lib/supabase/mapeamento.ts`
e o padrão das rotas em `src/app/api/`.

## Contexto que você precisa saber (já configurado, não mexer)

- O Supabase já tem as tabelas `pacientes` e `consultas` (ver
  `src/lib/types.ts` para os campos).
- Foi adicionada esta coluna em `consultas` (já rodada manualmente, não
  precisa criar):
```sql
  alter table consultas add column if not exists lembrete_enviado_em timestamptz;
```
- O template da mensagem já foi criado e aprovado no Meta Business Manager,
  com o nome definido pela variável de ambiente `WHATSAPP_TEMPLATE_NAME`,
  no idioma `pt_BR`, com corpo usando 4 variáveis posicionais na ordem:
  `{{1}}` = nome do paciente, `{{2}}` = data (formato "dd/MM"), `{{3}}` =
  horário (formato "HH:mm"), `{{4}}` = procedimento. O template tem 2
  botões de resposta rápida (quick reply): índice 0 = "Confirmar presença",
  índice 1 = "Não vou poder ir".

## Variáveis de ambiente a adicionar (`.env.example` e documentar no README)

WHATSAPP_TOKEN= # token de acesso permanente (System User)
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_TEMPLATE_NAME=lembrete_consulta
WHATSAPP_VERIFY_TOKEN= # escolhido por mim, usado na verificação do webhook
WHATSAPP_APP_SECRET= # usado para validar assinatura do webhook
CRON_SECRET= # protege a rota de cron contra chamadas externas


## O que implementar

**1. `src/lib/whatsapp.ts`**

Exporte uma função:
```ts
async function enviarLembreteWhatsapp(params: {
  telefone: string;       // já no formato salvo em pacientes.telefone
  nome: string;
  dataFormatada: string;  // "dd/MM"
  horario: string;        // "HH:mm"
  procedimento: string;
  consultaId: string;
}): Promise<void>
```

Ela deve:
- Normalizar o telefone para o formato E.164 que a API exige (adicionar
  `55` na frente se não tiver, remover caracteres não numéricos).
- Fazer um `POST` para
  `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`
  com header `Authorization: Bearer ${WHATSAPP_TOKEN}`, enviando um payload
  de mensagem de template com os 4 parâmetros do corpo E com os botões
  usando parâmetro dinâmico de `payload` (component type `"button"`,
  sub_type `"quick_reply"`), assim:
  - Botão índice 0 → payload `confirmar:${consultaId}`
  - Botão índice 1 → payload `cancelar:${consultaId}`

  (Isso é o que permite, quando a pessoa tocar no botão, identificar qual
  consulta e qual ação no webhook — o payload volta exatamente como foi
  enviado.)
- Se a resposta da API não for OK, lançar um erro com a mensagem retornada
  pela Meta (para aparecer no log de quem chamou a função).

**2. `src/app/api/cron/lembretes/route.ts`**

- `GET` (Vercel Cron sempre chama via GET).
- Proteger a rota: verificar o header `Authorization` contra
  `Bearer ${process.env.CRON_SECRET}` — se não bater, retornar 401.
- Calcular a data de amanhã (fuso horário do Brasil — cuidado com apenas
  usar `new Date()` cru, considere o offset).
- Usando `criarClienteServidor()`, buscar em `consultas`: `data = amanhã`,
  `status` não em `('cancelado', 'concluido')`, `lembrete_enviado_em is null`.
- Para cada consulta, buscar o paciente vinculado (`paciente_id`) para
  pegar nome e telefone.
- Chamar `enviarLembreteWhatsapp(...)` para cada uma, dentro de um
  try/catch individual (uma falha não deve interromper as demais).
- Em caso de sucesso, atualizar essa consulta com
  `lembrete_enviado_em = now()`.
- Retornar um JSON resumindo quantas mensagens foram enviadas e quantas
  falharam (com os erros), para eu conseguir ver no log da Vercel.

**3. `vercel.json`** (criar ou atualizar na raiz do projeto)

```json
{
  "crons": [
    { "path": "/api/cron/lembretes", "schedule": "0 21 * * *" }
  ]
}
```
(21h UTC = 18h horário de Brasília — a Vercel Cron sempre usa UTC, deixe um
comentário no README explicando essa conversão para eu poder ajustar o
horário depois se quiser.)

**4. `src/app/api/webhooks/whatsapp/route.ts`**

- **`GET`** — implementa a verificação inicial do webhook exigida pela
  Meta: ler os query params `hub.mode`, `hub.verify_token`,
  `hub.challenge`; se `hub.verify_token` bater com
  `process.env.WHATSAPP_VERIFY_TOKEN`, responder com o valor de
  `hub.challenge` em texto puro (status 200); senão, responder 403.

- **`POST`** — recebe os eventos do WhatsApp:
  - Antes de processar, validar a assinatura do corpo da requisição usando
    o header `x-hub-signature-256` e `WHATSAPP_APP_SECRET` (HMAC SHA-256
    do corpo bruto da requisição) — rejeitar com 401 se não bater.
  - Extrair do payload o campo do botão pressionado (é um objeto de
    mensagem com `type: "button"`, contendo o `payload` que foi definido
    no envio — ex: `"confirmar:abc-123"` ou `"cancelar:abc-123"`).
  - Separar a string pelo `:` para pegar a ação e o `consultaId`.
  - Se ação for `confirmar`: `update consultas set status = 'confirmado'`
    onde `id = consultaId` **e** `status not in ('concluido', 'cancelado')`
    (evita sobrescrever um status que já avançou).
  - Se ação for `cancelar`: mesma lógica, mas `status = 'cancelado'`.
  - Opcionalmente, enviar de volta uma mensagem de texto simples de
    confirmação (“Consulta confirmada! Te esperamos.” ou “Tudo bem,
    cancelamos sua consulta.”) usando o mesmo endpoint de envio da Cloud
    API (mensagem de texto livre, não precisa de template, pois estamos
    dentro da janela de atendimento de 24h aberta pela resposta do
    paciente).
  - Sempre responder `200 OK` rapidamente para a Meta, mesmo que algo
    interno falhe (logar o erro, mas não deixar a Meta re-tentar
    indefinidamente por timeout/erro 500).

## Verificações finais

- Rode `npm run build` e confirme que não há erro de tipo.
- Documente no README, em uma seção nova, como configurar o webhook no
  painel da Meta (URL = `https://SEU-DOMINIO/api/webhooks/whatsapp` +
  o `WHATSAPP_VERIFY_TOKEN` escolhido) e como funciona o cron da Vercel.
- Não implemente nenhum fluxo de conversa, menu, ou resposta a texto livre
  do paciente além do que foi descrito no item 4 — qualquer mensagem que
  não seja um toque nos 2 botões esperados deve ser ignorada silenciosamente
  pelo webhook (apenas responder 200 OK sem processar nada).
