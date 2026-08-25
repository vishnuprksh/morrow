# Graph Report - haha  (2026-08-25)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 242 nodes · 266 edges · 54 communities (15 shown, 39 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8a26b342`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- devDependencies
- createClient
- compilerOptions
- app/page.tsx
- client.ts
- scripts
- portability.ts
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
1. `createClient()` - 17 edges
2. `compilerOptions` - 17 edges
3. `Home()` - 14 edges
4. `scripts` - 8 edges
5. `createAutosaveController()` - 7 edges
6. `getSupabaseEnv()` - 7 edges
7. `safeFilename()` - 7 edges
8. `workspaceZip()` - 7 edges
9. `include` - 7 edges
10. `removeRecoveryCopy()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `proxy()` --calls--> `updateSession()`  [EXTRACTED]
  proxy.ts → src/lib/supabase/middleware.ts
- `submit()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/auth-form.tsx → src/lib/supabase/client.ts
- `submit()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/forgot-password/page.tsx → src/lib/supabase/client.ts
- `submit()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/update-password/page.tsx → src/lib/supabase/client.ts
- `createFolder()` --calls--> `createClient()`  [EXTRACTED]
  src/app/page.tsx → src/lib/supabase/client.ts

## Import Cycles
- None detected.

## Communities (54 total, 39 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.05
Nodes (39): ai, @ai-sdk/openai, jszip, lucide-react, @milkdown/core, @milkdown/plugin-listener, @milkdown/preset-commonmark, @milkdown/preset-gfm (+31 more)

### Community 1 - "devDependencies"
Cohesion: 0.07
Nodes (27): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, postcss (+19 more)

### Community 2 - "createClient"
Cohesion: 0.12
Nodes (15): AuthForm(), submit(), SignOutButton(), ForgotPasswordPage(), submit(), UpdatePasswordPage(), submit(), Home() (+7 more)

### Community 3 - "compilerOptions"
Cohesion: 0.10
Nodes (21): dom, dom.iterable, esnext, vitest/globals, compilerOptions, allowJs, esModuleInterop, incremental (+13 more)

### Community 4 - "app/page.tsx"
Cohesion: 0.18
Nodes (17): FolderRow, NoteRow, RecoveryNotice(), AutosaveController, AutosaveResult, createAutosaveController(), attempt(), flush() (+9 more)

### Community 5 - "client.ts"
Cohesion: 0.27
Nodes (8): config, proxy(), GET(), Database, Json, getSupabaseEnv(), updateSession(), createClient()

### Community 6 - "scripts"
Cohesion: 0.15
Nodes (12): name, packageManager, private, scripts, build, dev, lint, start (+4 more)

### Community 7 - "portability.ts"
Cohesion: 0.36
Nodes (9): exportNote(), exportWorkspace(), downloadBlob(), folderPath(), noteMarkdown(), PortableFolder, PortableNote, safeFilename() (+1 more)

### Community 8 - "include"
Cohesion: 0.20
Nodes (9): .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, src/**/*.ts, src/**/*.tsx, vitest.config.ts, exclude (+1 more)

### Community 9 - "markdown-editor.tsx"
Cohesion: 0.29
Nodes (4): MarkdownEditor(), MarkdownEditorProps, ToolbarAction, toolbarActions

### Community 10 - ".prettierrc.json"
Cohesion: 0.50
Nodes (3): semi, singleQuote, trailingComma

## Knowledge Gaps
- **119 isolated node(s):** `FolderRow`, `NoteRow`, `AutosaveResult`, `Entry`, `SaveNote` (+114 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `createClient()` connect `createClient` to `app/page.tsx`, `client.ts`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `FolderRow`, `NoteRow`, `AutosaveResult` to the rest of the system?**
  _119 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `createClient` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._