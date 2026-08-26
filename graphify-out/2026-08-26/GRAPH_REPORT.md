# Graph Report - haha  (2026-08-26)

## Corpus Check
- 51 files · ~13,666 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 263 nodes · 334 edges · 27 communities (18 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `14c7eab0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- createClient
- devDependencies
- createClient
- markdown-editor.tsx
- app/page.tsx
- compilerOptions
- scripts
- include
- portability.ts
- credentials.ts
- .prettierrc.json
- ai-settings.tsx
- layout.tsx
- SettingsPage
- validation.ts
- next.config.ts
- next-env.d.ts
- postcss.config.mjs
- Morrow — AI Markdown Notes
- AGENTS.md

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 20 edges
2. `Home()` - 17 edges
3. `compilerOptions` - 17 edges
4. `createClient()` - 10 edges
5. `scripts` - 8 edges
6. `MarkdownEditor()` - 7 edges
7. `createAutosaveController()` - 7 edges
8. `getSupabaseEnv()` - 7 edges
9. `include` - 7 edges
10. `removeRecoveryCopy()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `proxy()` --calls--> `updateSession()`  [EXTRACTED]
  proxy.ts → src/lib/supabase/middleware.ts
- `GET()` --calls--> `createClient()`  [EXTRACTED]
  src/app/api/attachments/[noteId]/[filename]/route.ts → src/lib/supabase/server.ts
- `submit()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/auth-form.tsx → src/lib/supabase/client.ts
- `submit()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/forgot-password/page.tsx → src/lib/supabase/client.ts
- `submit()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/update-password/page.tsx → src/lib/supabase/client.ts

## Import Cycles
- None detected.

## Communities (27 total, 9 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.05
Nodes (39): ai, @ai-sdk/openai, jszip, lucide-react, @milkdown/core, @milkdown/plugin-listener, @milkdown/preset-commonmark, @milkdown/preset-gfm (+31 more)

### Community 1 - "createClient"
Cohesion: 0.10
Nodes (20): AuthForm(), submit(), SignOutButton(), ForgotPasswordPage(), submit(), UpdatePasswordPage(), submit(), Home() (+12 more)

### Community 2 - "devDependencies"
Cohesion: 0.07
Nodes (27): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, postcss (+19 more)

### Community 3 - "createClient"
Cohesion: 0.14
Nodes (17): config, proxy(), boundedText(), noteId, POST(), isPreset(), POST(), Preset (+9 more)

### Community 4 - "markdown-editor.tsx"
Cohesion: 0.10
Nodes (15): AgentPanel(), ChatMessage, NoteContext, EditAction, editActions, MarkdownEditor(), requestEdit(), submitCustomInstruction() (+7 more)

### Community 5 - "app/page.tsx"
Cohesion: 0.16
Nodes (18): FolderRow, NoteAction, NoteRow, RecoveryNotice(), AutosaveController, AutosaveResult, createAutosaveController(), attempt() (+10 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (21): dom, dom.iterable, esnext, vitest/globals, compilerOptions, allowJs, esModuleInterop, incremental (+13 more)

### Community 7 - "scripts"
Cohesion: 0.15
Nodes (12): name, packageManager, private, scripts, build, dev, lint, start (+4 more)

### Community 8 - "include"
Cohesion: 0.20
Nodes (9): .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, src/**/*.ts, src/**/*.tsx, vitest.config.ts, exclude (+1 more)

### Community 9 - "portability.ts"
Cohesion: 0.42
Nodes (6): folderPath(), noteMarkdown(), PortableFolder, PortableNote, safeFilename(), workspaceZip()

### Community 10 - "credentials.ts"
Cohesion: 0.80
Nodes (3): decryptApiKey(), encryptApiKey(), encryptionKey()

### Community 11 - ".prettierrc.json"
Cohesion: 0.50
Nodes (3): semi, singleQuote, trailingComma

## Knowledge Gaps
- **99 isolated node(s):** `semi`, `singleQuote`, `trailingComma`, `nextConfig`, `name` (+94 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `createClient()` connect `createClient` to `createClient`, `app/page.tsx`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **What connects `semi`, `singleQuote`, `trailingComma` to the rest of the system?**
  _99 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `createClient` be split into smaller, more focused modules?**
  _Cohesion score 0.10344827586206896 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._