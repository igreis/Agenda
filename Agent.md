Este projeto (Next.js + TypeScript + Supabase) tem 3 bugs relacionados à
funcionalidade de "Registrar atendimento" que acabou de ser implementada.
Investigue a causa raiz de cada um antes de alterar código — não faça
mudanças especulativas sem antes confirmar onde está o problema.

## Sintomas

1. Depois de registrar um atendimento, a consulta continua aparecendo como
   "Agendado" (não muda para "Concluído").
2. Por causa do sintoma 1, o botão "Registrar atendimento" continua
   disponível para a mesma consulta, permitindo registrar de novo.
3. O odontograma aparece em branco tanto ao abrir um novo atendimento
   (deveria pré-carregar o estado atual do paciente) quanto ao visualizar
   um atendimento já registrado (o dente marcado não aparece).

## Como investigar (siga nessa ordem)

**Passo 1 — Confirme o que está salvo no banco antes de mexer no código.**
Abra o Table Editor do Supabase e, depois de registrar um atendimento de
teste marcando um dente como "cariado", confira nas 3 tabelas:
- `atendimentos.odontograma` — tem o dente marcado, ou está `{}`?
- `pacientes.odontograma_atual` — foi atualizado com o dente, ou está `{}`?
- `consultas.status` — virou `"concluido"`, ou continua `"agendado"`?

Isso separa o problema em duas categorias possíveis: **(A) o backend não
está salvando/atualizando corretamente**, ou **(B) o backend está certo mas
o frontend não está lendo/exibindo o dado atualizado**. Trate cada bug
abaixo de acordo com o que você encontrar.

**Passo 2 — Se o banco NÃO tiver os dados corretos (categoria A):**

Abra `src/app/api/atendimentos/route.ts` e verifique o `POST`:
- As 3 operações (insert em `atendimentos`, update em `consultas`, update
  em `pacientes`) estão de fato sendo executadas em sequência, com `await`
  em cada uma?
- O `error` de cada chamada Supabase está sendo checado individualmente?
  É comum um erro de uma dessas 3 operações ser silenciosamente ignorado
  (por exemplo, se só o `error` do insert é checado, mas os dois updates
  seguintes não têm o retorno verificado) — isso explicaria o atendimento
  salvo mas a consulta não atualizada.
- No update de `consultas`, o `.eq("id", consultaId)` está usando a
  variável correta (confirme que `consultaId` recebido no body do POST é
  de fato o UUID da consulta, não do paciente ou do atendimento por engano).
- No merge do odontograma: o código busca o `odontograma_atual` **atual**
  do paciente antes de fazer o merge, ou está sobrescrevendo com base em um
  valor desatualizado/vazio?
- Adicione `console.error` (ou log equivalente) em cada `if (error)` dessas
  3 operações que hoje pode estar sem log, para expor erros silenciosos no
  terminal do servidor.

**Passo 3 — Se o banco JÁ tiver os dados corretos (categoria B):**

O bug está no frontend não refletir o estado novo. Verifique:
- Em `src/lib/hooks.ts`, o hook `useConsultas` (ou equivalente) — depois
  que `AtendimentoModal` salva com sucesso e chama `onSalvo()`, o código
  que recebe esse callback na página (`src/app/(app)/page.tsx` e
  `src/app/(app)/agenda/page.tsx`) está de fato chamando
  `recarregarConsultas()` (ou o nome equivalente da função de refetch)?
  Sem isso, a lista de consultas em tela continua com o dado antigo em
  cache, mesmo que o banco já esteja certo.
- A condição que decide mostrar o botão "Registrar atendimento" está lendo
  o `status` do objeto de consulta **depois** do refetch, não uma cópia
  antiga guardada em outro state.

**Passo 4 — Bug do odontograma em branco, especificamente:**

Depois de confirmar (via Passo 1) se o dado está ou não no banco:

- Se estiver vazio no banco: o problema é em `AtendimentoModal.tsx`, no
  cálculo do delta enviado para a API. Verifique se o state
  `odontogramaEditavel` que é enviado no submit reflete de fato os cliques
  feitos no `<Odontograma />` (pode haver stale closure se o valor
  enviado no `fetch`/submit estiver capturando uma versão antiga do state
  ao invés da mais recente). Verifique também se o nome do campo enviado
  no body do POST (`odontograma`) bate exatamente com o nome que a rota de
  API espera ler — um typo aqui salvaria `{}` silenciosamente sem erro.

- Se estiver correto no banco mas não aparecer na tela: o problema é em
  como o componente recebe os dados:
  - No `AtendimentoModal.tsx`, confirme que o `paciente` passado como prop
    é buscado com dado atualizado (não uma versão em cache antiga de antes
    do último atendimento) antes de inicializar
    `odontogramaEditavel = paciente.odontogramaAtual`.
  - Confirme em `src/lib/supabase/mapeamento.ts`, na função
    `linhaParaPaciente`, que o campo `odontogramaAtual` está sendo lido de
    `linha.odontograma_atual` (nome exato da coluna no banco) — um typo no
    nome da coluna faria isso sempre retornar `undefined` ou `{}`.
  - Na tela de histórico de atendimentos (perfil do paciente), confirme
    que está lendo `atendimento.odontograma` (não um nome de campo
    diferente) ao montar a lista.
  - Verifique se `<Odontograma valor={...} />` está recebendo o objeto
    correto e não um objeto vazio sendo passado por engano (ex: um state
    inicial que nunca é atualizado com o dado vindo da API).

## Depois de corrigir

Rode `npm run build` para confirmar que não há erro de tipo. Depois, teste
manualmente do zero, nessa ordem, e confirme cada etapa antes de passar
para a próxima:

1. Registrar um atendimento marcando um dente como "cariado"
2. Conferir no Supabase Table Editor que as 3 tabelas foram atualizadas
   corretamente (`atendimentos.odontograma`, `pacientes.odontograma_atual`,
   `consultas.status`)
3. Voltar para a Agenda/Painel sem dar refresh manual na página e confirmar
   que a consulta já aparece como "Concluído" e o botão "Registrar
   atendimento" não aparece mais para ela
4. Abrir um novo atendimento para o mesmo paciente (outra consulta) e
   confirmar que o odontograma já abre com o dente marcado
5. Abrir o histórico de atendimentos desse paciente e confirmar que o
   atendimento registrado aparece com o dente correto listado`
