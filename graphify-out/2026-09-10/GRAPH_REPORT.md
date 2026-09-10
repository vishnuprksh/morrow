# Graph Report - haha  (2026-09-10)

## Corpus Check
- 61 files · ~32,459 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 335 nodes · 448 edges · 30 communities (22 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `45c66dec`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- Home
- markdown-editor.tsx
- compilerOptions
- app/page.tsx
- devDependencies
- createClient
- vault-import.ts
- scripts
- Morrow
- agent-panel.tsx
- portability.ts
- credentials.ts
- trash.ts
- .prettierrc.json
- SettingsPage
- ai-settings.tsx
- app/layout.tsx
- validation.ts
- AGENTS.md
- next.config.ts
- next-env.d.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `Home()` - 24 edges
2. `createClient()` - 24 edges
3. `compilerOptions` - 17 edges
4. `MarkdownEditor()` - 13 edges
5. `createClient()` - 10 edges
6. `scripts` - 8 edges
7. `importVault()` - 8 edges
8. `createAutosaveController()` - 7 edges
9. `safeFilename()` - 7 edges
10. `getSupabaseEnv()` - 7 edges

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

## Communities (30 total, 8 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.05
Nodes (43): ai, @ai-sdk/openai, jszip, katex, lucide-react, @milkdown/core, @milkdown/plugin-listener, @milkdown/plugin-math (+35 more)

### Community 1 - "Home"
Cohesion: 0.08
Nodes (23): AuthForm(), submit(), SignOutButton(), ForgotPasswordPage(), submit(), UpdatePasswordPage(), submit(), Home() (+15 more)

### Community 2 - "markdown-editor.tsx"
Cohesion: 0.08
Nodes (20): EditAction, editActions, ImageSize, imageWidths, MarkdownEditor(), requestEdit(), submitCustomInstruction(), MarkdownEditorProps (+12 more)

### Community 3 - "compilerOptions"
Cohesion: 0.06
Nodes (30): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, src/**/*.ts (+22 more)

### Community 4 - "app/page.tsx"
Cohesion: 0.12
Nodes (19): FolderRow, moveToTrash(), NoteRow, NoteView, RecoveryNotice(), AutosaveController, AutosaveResult, createAutosaveController() (+11 more)

### Community 5 - "devDependencies"
Cohesion: 0.07
Nodes (27): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, postcss (+19 more)

### Community 6 - "createClient"
Cohesion: 0.14
Nodes (17): config, proxy(), boundedText(), noteId, POST(), isPreset(), POST(), Preset (+9 more)

### Community 7 - "vault-import.ts"
Cohesion: 0.19
Nodes (15): importVault(), loadWorkspace(), selectVault(), extension(), imageContentType(), imageExtensions, imageLookup(), imageReferences() (+7 more)

### Community 8 - "scripts"
Cohesion: 0.15
Nodes (12): name, packageManager, private, scripts, build, dev, lint, start (+4 more)

### Community 9 - "Morrow"
Cohesion: 0.17
Nodes (11): 1. Create Supabase resources, 2. Configure the environment, 3. Configure Auth redirects, 4. Install and run, Development commands, Getting started, Morrow, Preview (+3 more)

### Community 10 - "agent-panel.tsx"
Cohesion: 0.23
Nodes (9): AgentPanel(), send(), ChatMessage, extractNoteChangeProposal(), latestAgentError(), latestAgentStatus(), NoteContext, activeNote (+1 more)

### Community 11 - "portability.ts"
Cohesion: 0.36
Nodes (7): uploadImage(), folderPath(), noteMarkdown(), PortableFolder, PortableNote, safeFilename(), workspaceZip()

### Community 12 - "credentials.ts"
Cohesion: 0.80
Nodes (3): decryptApiKey(), encryptApiKey(), encryptionKey()

### Community 13 - "trash.ts"
Cohesion: 0.70
Nodes (3): isExpiredTrash(), TRASH_RETENTION_DAYS, trashExpiryCutoff()

### Community 14 - ".prettierrc.json"
Cohesion: 0.50
Nodes (3): semi, singleQuote, trailingComma

## Knowledge Gaps
- **120 isolated node(s):** `semi`, `singleQuote`, `trailingComma`, `nextConfig`, `name` (+115 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Home` to `portability.ts`, `app/page.tsx`, `createClient`, `vault-import.ts`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `getSupabaseEnv()` connect `createClient` to `Home`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `semi`, `singleQuote`, `trailingComma` to the rest of the system?**
  _120 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
- **Should `Home` be split into smaller, more focused modules?**
  _Cohesion score 0.08108108108108109 - nodes in this community are weakly interconnected._
- **Should `markdown-editor.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0784313725490196 - nodes in this community are weakly interconnected._