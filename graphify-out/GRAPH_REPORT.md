# Graph Report - haha  (2026-08-25)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 225 nodes · 228 edges · 53 communities (14 shown, 39 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6819219c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- devDependencies
- createClient
- compilerOptions
- app/page.tsx
- scripts
- client.ts
- include
- markdown-editor.tsx
- .prettierrc.json
- layout.tsx
- next.config.ts
- next-env.d.ts
- postcss.config.mjs
- Next.js Agent File Generator
- Next.js Agent Rules
- Next.js Local Documentation
- AGENTS.md Reference
- CI Workflow
- Lint Check
- Frozen pnpm Installation
- Quality Job
- Test Check
- Type Check
- Authentication and Database Security
- Autosave and Data Resilience
- Bring Your Own API Key
- WYSIWYG Markdown Editor Phase
- Milkdown Markdown Editor
- MVP Note Application
- Next.js App Router
- OpenRouter OpenAI-Compatible Provider
- Playwright
- ProseMirror
- React/Tailwind/shadcn/ui/Lucide UI Stack
- Row Level Security
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Vercel AI SDK
- Vitest
- Zod Validation
- Supabase Auth Redirect URL
- Email/Password Authentication
- .env.local Configuration
- Initial Schema Migration
- Morrow
- Phase 1 Authentication Features
- Supabase Project

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 17 edges
2. `createClient()` - 15 edges
3. `Home()` - 10 edges
4. `scripts` - 8 edges
5. `createAutosaveController()` - 7 edges
6. `getSupabaseEnv()` - 7 edges
7. `include` - 7 edges
8. `removeRecoveryCopy()` - 6 edges
9. `Database` - 4 edges
10. `AuthForm()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `proxy()` --calls--> `updateSession()`  [EXTRACTED]
  proxy.ts → src/lib/supabase/middleware.ts
- `submit()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/auth-form.tsx → src/lib/supabase/client.ts
- `submit()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/forgot-password/page.tsx → src/lib/supabase/client.ts
- `submit()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/update-password/page.tsx → src/lib/supabase/client.ts
- `Home()` --calls--> `createAutosaveController()`  [EXTRACTED]
  src/app/page.tsx → src/lib/notes/autosave.ts

## Import Cycles
- None detected.

## Communities (53 total, 39 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.05
Nodes (37): ai, @ai-sdk/openai, lucide-react, @milkdown/core, @milkdown/plugin-listener, @milkdown/preset-commonmark, @milkdown/preset-gfm, @milkdown/prose (+29 more)

### Community 1 - "devDependencies"
Cohesion: 0.07
Nodes (27): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, postcss (+19 more)

### Community 2 - "createClient"
Cohesion: 0.13
Nodes (13): AuthForm(), submit(), SignOutButton(), ForgotPasswordPage(), submit(), UpdatePasswordPage(), submit(), Home() (+5 more)

### Community 3 - "compilerOptions"
Cohesion: 0.10
Nodes (21): dom, dom.iterable, esnext, vitest/globals, compilerOptions, allowJs, esModuleInterop, incremental (+13 more)

### Community 4 - "app/page.tsx"
Cohesion: 0.18
Nodes (17): FolderRow, NoteRow, RecoveryNotice(), AutosaveController, AutosaveResult, createAutosaveController(), attempt(), flush() (+9 more)

### Community 5 - "scripts"
Cohesion: 0.15
Nodes (12): name, packageManager, private, scripts, build, dev, lint, start (+4 more)

### Community 6 - "client.ts"
Cohesion: 0.31
Nodes (7): config, proxy(), Database, Json, getSupabaseEnv(), updateSession(), createClient()

### Community 7 - "include"
Cohesion: 0.20
Nodes (9): .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, src/**/*.ts, src/**/*.tsx, vitest.config.ts, exclude (+1 more)

### Community 8 - "markdown-editor.tsx"
Cohesion: 0.29
Nodes (4): MarkdownEditor(), MarkdownEditorProps, ToolbarAction, toolbarActions

### Community 9 - ".prettierrc.json"
Cohesion: 0.50
Nodes (3): semi, singleQuote, trailingComma

## Knowledge Gaps
- **116 isolated node(s):** `FolderRow`, `NoteRow`, `AutosaveResult`, `Entry`, `SaveNote` (+111 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `createClient()` connect `createClient` to `app/page.tsx`, `client.ts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `FolderRow`, `NoteRow`, `AutosaveResult` to the rest of the system?**
  _116 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `createClient` be split into smaller, more focused modules?**
  _Cohesion score 0.12648221343873517 - nodes in this community are weakly interconnected._