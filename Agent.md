Preciso implementar login com Supabase Auth neste projeto Next.js (App
Router) + TypeScript. O projeto já está integrado ao Supabase para dados
(veja `src/lib/supabase/client.ts` e `src/lib/supabase/server.ts`, que já
existem e devem ser reaproveitados, não recriados). Leia a estrutura atual
do projeto antes de mexer em qualquer coisa.

## O que fazer, em ordem

**1. Reorganizar as rotas com um route group**

Mover as páginas atuais (`src/app/page.tsx`, `src/app/agenda/`,
`src/app/pacientes/`) para dentro de um novo grupo `src/app/(app)/` — ou
seja, `src/app/(app)/page.tsx`, `src/app/(app)/agenda/page.tsx`,
`src/app/(app)/pacientes/page.tsx`. Isso não muda nenhuma URL (route groups
com parênteses não aparecem na URL), só reorganiza fisicamente as pastas.

Motivo: a tela de login não pode ter a Sidebar do app, mas todas as outras
páginas precisam. Route group é a forma correta de ter dois layouts
diferentes convivendo.

**2. `src/app/(app)/layout.tsx`** (novo arquivo)

Deve renderizar a `Sidebar` (componente já existente em
`src/components/Sidebar.tsx`) envolvendo `{children}`, do mesmo jeito que o
layout raiz fazia antes.

**3. `src/app/layout.tsx`** (simplificar)

Remover a renderização da `Sidebar` daqui — ela agora é responsabilidade
exclusiva do layout do grupo `(app)`. Este arquivo deve manter apenas
`<html>`, `<head>` (incluindo os links de fonte, se já existirem) e
`<body>{children}</body>`, sem sidebar nem wrapper de layout do app.

**4. `src/app/login/page.tsx`** (novo — fica fora do grupo `(app)`, então
não recebe a Sidebar)

Client Component com formulário de e-mail e senha, chamando
`supabase.auth.signInWithPassword({ email, password })` usando o cliente de
`src/lib/supabase/client.ts`. Em caso de sucesso, redirecionar para `/`
com `router.push("/")` seguido de `router.refresh()`. Em caso de erro,
mostrar mensagem "E-mail ou senha inválidos." (não expor o erro técnico
bruto do Supabase). Seguir o mesmo estilo visual (Tailwind, cores, fontes)
já usado nos outros componentes do projeto — consulte
`src/components/Modal.tsx` ou `src/components/PacienteModal.tsx` para
referência de padrão visual (inputs, botões, cores `brand-*`).

Adicionar um texto pequeno no rodapé da tela explicando que a conta é
criada direto no painel do Supabase (Authentication → Users), já que não
haverá tela de cadastro público.

**5. `src/middleware.ts`** (novo — na raiz de `src/`, irmão da pasta `app/`)

Deve:
- Criar um cliente Supabase de servidor usando `createServerClient` de
  `@supabase/ssr`, lendo/gravando cookies da requisição (`request.cookies`),
  seguindo o padrão oficial de middleware do `@supabase/ssr` para Next.js
  App Router.
- Verificar a sessão do usuário (`supabase.auth.getUser()`).
- Se não houver usuário autenticado E a rota não for `/login`, redirecionar
  para `/login`.
- Se houver usuário autenticado E a rota for `/login`, redirecionar para `/`.
- Aplicar em todas as rotas exceto assets estáticos (`_next/static`,
  `_next/image`, `favicon.ico`, imagens) via `config.matcher`.

**6. Logout na Sidebar**

Em `src/components/Sidebar.tsx`, adicionar um botão "Sair" no rodapé (perto
de onde já mostra o nome do consultório) que chama
`supabase.auth.signOut()` (cliente de `src/lib/supabase/client.ts`) e depois
redireciona para `/login` com `router.push` + `router.refresh()`. Usar um
ícone de logout do `lucide-react` (ex: `LogOut`) consistente com os outros
ícones já usados no componente.

## Verificações finais

- Rode `npm run build` e confirme que não há erro de tipo, incluindo o
  `middleware.ts` sendo reconhecido corretamente pelo Next.js.
- Confirme que `src/app/(app)/layout.tsx` não duplica nenhum wrapper HTML
  (`<html>`, `<body>`) que já existe no `src/app/layout.tsx` — route groups
  compartilham o layout raiz, então o layout do grupo deve conter *apenas*
  a Sidebar + main, não repetir a estrutura HTML inteira.
- Não implemente tela de cadastro/registro público, recuperação de senha,
  nem qualquer fluxo além de login e logout — isso é intencional, o único
  jeito de criar usuário é manual, pelo painel do Supabase.
- Não mude nada relacionado às rotas de API (`src/app/api/...`) nesta
  tarefa — login é só nas páginas, a proteção das rotas de API fica para
  uma etapa separada depois.

Depois de implementar, teste manualmente: acessar `/agenda` sem estar
logado deve redirecionar para `/login`; fazer login deve levar para `/`;
clicar em "Sair" deve voltar para `/login` e bloquear acesso de novo.
