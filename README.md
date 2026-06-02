# NextTech

Frontend da plataforma web educacional NextTech, criada com React e Vite. O projeto oferece uma experiência de aprendizagem com autenticação, trilhas por módulos, aulas, atividades avaliativas, progressão por XP, conquistas, ranking e área de gestão para professores.

## Tecnologias

- React 18
- Vite 5
- React Router DOM
- Axios
- PostgreSQL, conforme o schema em `schema_postgresql.sql`

## Funcionalidades

- Cadastro, login e recuperação de senha.
- Dashboard do aluno com módulos, desafios, XP, nível e streak.
- Página de módulo com aula, vídeo do YouTube, blocos de leitura, interações e conclusão de progresso.
- Atividades de múltipla escolha e desafios de código com feedback imediato.
- Perfil do usuário com edição de dados, alteração de senha e conquistas.
- Ranking semanal, mensal e geral.
- Turmas com código de convite e ranking interno.
- Área de gestão para professores criarem turmas, conteúdos, aulas, questões e vínculos entre turmas e módulos.

## Requisitos

- Node.js 18 ou superior
- npm
- Backend compatível com os endpoints usados pelo frontend
- Banco PostgreSQL, caso esteja configurando o backend localmente

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

3. Ajuste a variável de ambiente:

```env
VITE_API_BASE_URL=https://backendnext-ni5g.onrender.com/api
```

Se a variável não for definida, o frontend usa `https://backendnext-ni5g.onrender.com/api` como URL padrão da API.

## Scripts

```bash
npm run dev
```

Inicia o servidor de desenvolvimento do Vite.

```bash
npm run build
```

Gera a versão de produção em `dist`.

```bash
npm run preview
```

Serve localmente a build de produção para conferência.

## Estrutura

```text
.
├── public/
├── src/
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── .env.example
├── schema_postgresql.sql
├── package.json
└── vite.config.js
```

## Rotas Principais

- `/`: autenticação, cadastro e recuperação de senha.
- `/dashboard`: painel principal do aluno ou professor.
- `/modulo/:moduleId`: conteúdo de um módulo.
- `/atividades/:moduleId`: atividades avaliativas do módulo.
- `/perfil`: dados do usuário e conquistas.
- `/ranking`: rankings por XP.
- `/gestao`: gestão acadêmica, disponível para professores.

## Integração com a API

O cliente HTTP fica em `src/services/api.js`. Ele configura o `baseURL` a partir de `VITE_API_BASE_URL` e envia automaticamente o token salvo em `localStorage` no cabeçalho `Authorization`.

Principais grupos de endpoints consumidos:

- `/auth`: login, cadastro, recuperação e redefinição de senha.
- `/users`: dados do usuário, XP, progresso, perfil, ranking, conquistas e turmas.
- `/content`: módulos, aulas, atividades e desafios.

## Banco de Dados

O arquivo `schema_postgresql.sql` descreve as tabelas esperadas para a aplicação, incluindo:

- usuários
- módulos
- aulas
- atividades
- desafios
- progresso por módulo
- cursos concluídos
- conquistas
- turmas
- membros de turmas
- conteúdos vinculados a turmas

Esse schema é uma referência para o backend que atende este frontend.

## Observações de Desenvolvimento

- O projeto é um frontend Vite e depende de uma API externa ou local para funcionar completamente.
- A autenticação é baseada em token armazenado no `localStorage`.
- Usuários com papel `professor` acessam a área de gestão; usuários comuns acessam a jornada de aprendizagem.
- Alguns textos do código-fonte parecem ter problemas de codificação de caracteres. Caso mexa em conteúdo textual da interface, vale revisar a acentuação exibida no navegador.
