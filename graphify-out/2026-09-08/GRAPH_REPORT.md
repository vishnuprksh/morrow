# Graph Report - haha  (2026-08-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 288 nodes · 376 edges · 29 communities (20 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e3d60ddd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- markdown-editor.tsx
- createClient
- devDependencies
- createClient
- app/page.tsx
- compilerOptions
- vault-import.ts
- scripts
- include
- portability.ts
- credentials.ts
- .prettierrc.json
- Morrow — AI Markdown Notes
- ai-settings.tsx
- app/layout.tsx
- SettingsPage
- validation.ts
- AGENTS.md
- next.config.ts
- next-env.d.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 21 edges
2. `Home()` - 19 edges
3. `compilerOptions` - 17 edges
4. `createClient()` - 10 edges
5. `scripts` - 8 edges
6. `MarkdownEditor()` - 7 edges
7. `safeFilename()` - 7 edges
8. `getSupabaseEnv()` - 7 edges
9. `createAutosaveController()` - 7 edges
10. `importVault()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `proxy()` --calls--> `updateSession()`  [EXTRACTED]
  proxy.ts → src/lib/supabase/middleware.ts
- `importVault()` --calls--> `safeFilename()`  [EXTRACTED]
  src/app/page.tsx → src/lib/notes/portability.ts
- `uploadImage()` --calls--> `safeFilename()`  [EXTRACTED]
  src/app/page.tsx → src/lib/notes/portability.ts
- `submit()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/auth-form.tsx → src/lib/supabase/client.ts
- `submit()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/forgot-password/page.tsx → src/lib/supabase/client.ts

## Import Cycles
- None detected.

## Communities (29 total, 9 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.05
Nodes (43): ai, @ai-sdk/openai, jszip, katex, lucide-react, @milkdown/core, @milkdown/plugin-listener, @milkdown/plugin-math (+35 more)

### Community 1 - "markdown-editor.tsx"
Cohesion: 0.09
Nodes (16): AgentPanel(), ChatMessage, NoteContext, EditAction, editActions, MarkdownEditor(), requestEdit(), submitCustomInstruction() (+8 more)

### Community 2 - "createClient"
Cohesion: 0.11
Nodes (20): AuthForm(), submit(), SignOutButton(), ForgotPasswordPage(), submit(), UpdatePasswordPage(), submit(), Home() (+12 more)

### Community 3 - "devDependencies"
Cohesion: 0.07
Nodes (27): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, postcss (+19 more)

### Community 4 - "createClient"
Cohesion: 0.14
Nodes (17): config, proxy(), boundedText(), noteId, POST(), isPreset(), POST(), Preset (+9 more)

### Community 5 - "app/page.tsx"
Cohesion: 0.13
Nodes (17): FolderRow, NoteRow, RecoveryNotice(), AutosaveController, AutosaveResult, createAutosaveController(), attempt(), flush() (+9 more)

### Community 6 - "compilerOptions"
Cohesion: 0.10
Nodes (21): dom, dom.iterable, esnext, vitest/globals, compilerOptions, allowJs, esModuleInterop, incremental (+13 more)

### Community 7 - "vault-import.ts"
Cohesion: 0.18
Nodes (13): importVault(), loadWorkspace(), selectVault(), extension(), imageExtensions, imageLookup(), imageReferences(), parseVaultFiles() (+5 more)

### Community 8 - "scripts"
Cohesion: 0.15
Nodes (12): name, packageManager, private, scripts, build, dev, lint, start (+4 more)

### Community 9 - "include"
Cohesion: 0.20
Nodes (9): .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, src/**/*.ts, src/**/*.tsx, vitest.config.ts, exclude (+1 more)

### Community 10 - "portability.ts"
Cohesion: 0.42
Nodes (6): folderPath(), noteMarkdown(), PortableFolder, PortableNote, safeFilename(), workspaceZip()

### Community 11 - "credentials.ts"
Cohesion: 0.80
Nodes (3): decryptApiKey(), encryptApiKey(), encryptionKey()

### Community 12 - ".prettierrc.json"
Cohesion: 0.50
Nodes (3): semi, singleQuote, trailingComma

## Knowledge Gaps
- **103 isolated node(s):** `ChatMessage`, `NoteContext`, `EditAction`, `MarkdownEditorProps`, `ToolbarAction` (+98 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `createClient()` connect `createClient` to `createClient`, `app/page.tsx`, `vault-import.ts`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `getSupabaseEnv()` connect `createClient` to `createClient`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `ChatMessage`, `NoteContext`, `EditAction` to the rest of the system?**
  _103 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
- **Should `markdown-editor.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09259259259259259 - nodes in this community are weakly interconnected._
- **Should `createClient` be split into smaller, more focused modules?**
  _Cohesion score 0.11375661375661375 - nodes in this community are weakly interconnected._