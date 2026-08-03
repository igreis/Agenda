# DentaAgenda

Sistema de agendamento para consultório odontológico solo — painel de controle,
agenda visual (mês/semana/dia), cadastro de pacientes e prontuário clínico básico.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- **lucide-react** (ícones) e **date-fns** (datas, em pt-BR)
- Persistência simples em arquivo JSON (`data/db.json`) via API Routes —
  fácil de trocar depois por Postgres/Supabase sem mexer no frontend,
  já que toda leitura/escrita passa por `src/lib/db.ts`.

Não há login/autenticação ainda (conforme combinado) — é só rodar e usar.

## Como rodar

```bash
npm install
npm run dev
```

Acesse http://localhost:3000

Para build de produção:

```bash
npm run build
npm start
```

## Estrutura

```
src/
  app/
    page.tsx                    → Painel (dashboard)
    agenda/page.tsx             → Agenda (mês / semana / dia)
    pacientes/page.tsx          → Lista de pacientes
    pacientes/[id]/page.tsx     → Prontuário do paciente (odontograma + histórico)
    api/
      pacientes/                → CRUD de pacientes
      consultas/                → CRUD de consultas
      atendimentos/             → CRUD de atendimentos (prontuário)
  components/
    Sidebar.tsx
    Modal.tsx
    ConsultaModal.tsx           → criar/editar consulta
    AtendimentoModal.tsx        → registrar atendimento clínico
    PacienteModal.tsx           → criar/editar paciente
    StatusBadge.tsx
    Odontograma.tsx             → odontograma clínico (marcar condição por dente)
    SeletorDenteConsulta.tsx    → seletor de dente opcional no agendamento
    agenda/
      MonthView.tsx
      WeekView.tsx
      DayAgendaList.tsx
  lib/
    types.ts                    → tipos Paciente / Consulta / Atendimento
    db.ts                       → leitura/escrita do JSON (troque aqui por um DB real)
    hooks.ts                    → hooks de dados no cliente (fetch + CRUD)
    utils.ts                    → helpers de data/formatação
data/
  db.json                       → "banco de dados" com alguns registros de exemplo
```

## O que já funciona

- Dashboard com estatísticas do dia e lista de consultas de hoje
- Agenda com 3 visualizações (mês, semana, dia), navegação entre períodos
  e criação de consulta clicando em qualquer dia
- CRUD completo de pacientes e consultas (criar, editar, excluir)
- Sincronização automática do nome do paciente nas consultas ao editar
- **Seleção de dente (opcional) ao agendar** — no formulário de nova
  consulta, um campo recolhível "Selecionar dente (opcional)" abre um
  odontograma compacto (dentição permanente) para marcar quais dentes a
  consulta envolve. Fica salvo em `Consulta.dentes` (array de números FDI).
- **Registro clínico de atendimento (prontuário básico)** — separa o
  *status da consulta* (agenda) do *histórico clínico* (o que aconteceu
  no consultório):
  - Botão **Registrar atendimento** no Painel e na Agenda, visível para
    consultas de hoje ou passadas que ainda não estão concluídas ou canceladas.
  - Formulário com procedimento realizado, observações, próximo passo e
    odontograma opcional (inicializado com o mapa bucal atual do paciente).
  - Ao salvar, a consulta vinculada é marcada como **concluída** automaticamente.
  - Cada atendimento fica gravado em `Atendimento` com histórico cronológico.
- **Odontograma em dois níveis**:
  - `Paciente.odontogramaAtual` — mapa bucal acumulado e sempre atualizado
    (visível e editável na página de prontuário do paciente).
  - `Atendimento.odontograma` — apenas os dentes alterados naquele
    atendimento específico (histórico pontual). Ao registrar um atendimento
    com alterações, a API faz merge no odontograma do paciente.
- **Página de prontuário** (`/pacientes/[id]`) — odontograma geral do
  paciente + histórico de atendimentos (mais recente primeiro).

Os componentes de odontograma usam a biblioteca open source
[`react-odontogram`](https://github.com/biomathcode/react-odontogram)
(MIT), com numeração FDI e ilustrações de dente realistas. Por enquanto
cobre só a dentição permanente — dentição decídua (dentes de leite) fica
para uma próxima etapa.

## Próximos passos sugeridos

1. **Lembrete via WhatsApp**: recomendo a API oficial
   da Meta (Cloud API) com template de categoria *utility*, disparado por um
   cron job (`pg_cron`, ou um worker separado) que roda 1x por dia e busca as
   consultas de amanhã em `data/db.json` (ou no banco, quando migrar).
2. **Banco de dados real**: trocar `src/lib/db.ts` por Supabase/Postgres
   quando for para produção — o resto do app não muda, pois toda a leitura/
   escrita passa por esse arquivo.
3. **Login**: quando quiser adicionar autenticação (ex.: para acesso remoto
   fora do consultório), o Supabase Auth se encaixa bem com o restante da stack.
4. **Anexos no prontuário**: o campo `Atendimento.anexos` já existe no modelo
   para evoluir com upload de radiografias e fotos intraorais.
