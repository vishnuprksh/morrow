# Graph Report - haha  (2026-08-25)

## Corpus Check
- 44 files · ~11,704 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 274 nodes · 320 edges · 56 communities (16 shown, 40 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9915d896`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- devDependencies
- app/page.tsx
- createClient
- compilerOptions
- client.ts
- settings/route.ts
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
- morrow-phase5-check.md

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 17 edges
2. `compilerOptions` - 17 edges
3. `Home()` - 14 edges
4. `scripts` - 8 edges
5. `createClient()` - 8 edges
6. `decryptApiKey()` - 7 edges
7. `createAutosaveController()` - 7 edges
8. `safeFilename()` - 7 edges
9. `workspaceZip()` - 7 edges
10. `getSupabaseEnv()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `proxy()` --calls--> `updateSession()`  [EXTRACTED]
  proxy.ts → src/lib/supabase/middleware.ts
- `POST()` --calls--> `createClient()`  [EXTRACTED]
  src/app/api/ai/edit/route.ts → src/lib/supabase/server.ts
- `authenticatedClient()` --calls--> `createClient()`  [EXTRACTED]
  src/app/api/ai/settings/route.ts → src/lib/supabase/server.ts
- `GET()` --calls--> `createClient()`  [EXTRACTED]
  src/app/api/attachments/[noteId]/[filename]/route.ts → src/lib/supabase/server.ts
- `submit()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/auth-form.tsx → src/lib/supabase/client.ts

## Import Cycles
- None detected.

## Communities (56 total, 40 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.05
Nodes (39): ai, @ai-sdk/openai, jszip, lucide-react, @milkdown/core, @milkdown/plugin-listener, @milkdown/preset-commonmark, @milkdown/preset-gfm (+31 more)

### Community 1 - "devDependencies"
Cohesion: 0.07
Nodes (27): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, postcss (+19 more)

### Community 2 - "app/page.tsx"
Cohesion: 0.13
Nodes (19): AiSettings(), Credential, FolderRow, NoteRow, RecoveryNotice(), AutosaveController, AutosaveResult, createAutosaveController() (+11 more)

### Community 3 - "createClient"
Cohesion: 0.12
Nodes (15): AuthForm(), submit(), SignOutButton(), ForgotPasswordPage(), submit(), UpdatePasswordPage(), submit(), Home() (+7 more)

### Community 4 - "compilerOptions"
Cohesion: 0.10
Nodes (21): dom, dom.iterable, esnext, vitest/globals, compilerOptions, allowJs, esModuleInterop, incremental (+13 more)

### Community 5 - "client.ts"
Cohesion: 0.27
Nodes (8): config, proxy(), GET(), Database, Json, getSupabaseEnv(), updateSession(), createClient()

### Community 6 - "settings/route.ts"
Cohesion: 0.19
Nodes (15): isPreset(), POST(), Preset, presets, authenticatedClient(), DELETE(), GET(), POST() (+7 more)

### Community 7 - "scripts"
Cohesion: 0.15
Nodes (12): name, packageManager, private, scripts, build, dev, lint, start (+4 more)

### Community 8 - "portability.ts"
Cohesion: 0.36
Nodes (9): exportNote(), exportWorkspace(), downloadBlob(), folderPath(), noteMarkdown(), PortableFolder, PortableNote, safeFilename() (+1 more)

### Community 9 - "include"
Cohesion: 0.20
Nodes (9): .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, src/**/*.ts, src/**/*.tsx, vitest.config.ts, exclude (+1 more)

### Community 10 - "markdown-editor.tsx"
Cohesion: 0.18
Nodes (6): EditAction, editActions, MarkdownEditor(), MarkdownEditorProps, ToolbarAction, toolbarActions

### Community 11 - ".prettierrc.json"
Cohesion: 0.50
Nodes (3): semi, singleQuote, trailingComma

## Knowledge Gaps
- **126 isolated node(s):** `semi`, `singleQuote`, `trailingComma`, `nextConfig`, `name` (+121 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **40 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `getSupabaseEnv()` connect `client.ts` to `createClient`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `createClient()` connect `createClient` to `app/page.tsx`, `client.ts`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `semi`, `singleQuote`, `trailingComma` to the rest of the system?**
  _126 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `app/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12615384615384614 - nodes in this community are weakly interconnected._