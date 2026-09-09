# Graph Report - haha  (2026-09-08)

## Corpus Check
- 57 files · ~15,967 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 298 nodes · 391 edges · 28 communities (19 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7c026fb3`
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
- trash.ts
- scripts
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
1. `createClient()` - 24 edges
2. `Home()` - 22 edges
3. `compilerOptions` - 17 edges
4. `createClient()` - 10 edges
5. `scripts` - 8 edges
6. `MarkdownEditor()` - 7 edges
7. `importVault()` - 7 edges
8. `createAutosaveController()` - 7 edges
9. `safeFilename()` - 7 edges
10. `getSupabaseEnv()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `proxy()` --calls--> `updateSession()`  [EXTRACTED]
  proxy.ts → src/lib/supabase/middleware.ts
- `selectVault()` --calls--> `parseVaultFiles()`  [EXTRACTED]
  src/app/page.tsx → src/lib/notes/vault-import.ts
- `GET()` --calls--> `createClient()`  [EXTRACTED]
  src/app/api/attachments/[noteId]/[filename]/route.ts → src/lib/supabase/server.ts
- `submit()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/auth-form.tsx → src/lib/supabase/client.ts
- `submit()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/forgot-password/page.tsx → src/lib/supabase/client.ts

## Import Cycles
- None detected.

## Communities (28 total, 9 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.05
Nodes (43): ai, @ai-sdk/openai, jszip, katex, lucide-react, @milkdown/core, @milkdown/plugin-listener, @milkdown/plugin-math (+35 more)

### Community 1 - "markdown-editor.tsx"
Cohesion: 0.09
Nodes (16): AgentPanel(), ChatMessage, NoteContext, EditAction, editActions, MarkdownEditor(), requestEdit(), submitCustomInstruction() (+8 more)

### Community 2 - "createClient"
Cohesion: 0.10
Nodes (23): AuthForm(), submit(), SignOutButton(), ForgotPasswordPage(), submit(), UpdatePasswordPage(), submit(), Home() (+15 more)

### Community 3 - "devDependencies"
Cohesion: 0.07
Nodes (27): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, postcss (+19 more)

### Community 4 - "createClient"
Cohesion: 0.14
Nodes (17): config, proxy(), boundedText(), noteId, POST(), isPreset(), POST(), Preset (+9 more)

### Community 5 - "app/page.tsx"
Cohesion: 0.09
Nodes (30): FolderRow, importVault(), moveToTrash(), NoteRow, NoteView, RecoveryNotice(), AutosaveController, AutosaveResult (+22 more)

### Community 6 - "compilerOptions"
Cohesion: 0.06
Nodes (30): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, src/**/*.ts (+22 more)

### Community 7 - "trash.ts"
Cohesion: 0.70
Nodes (3): isExpiredTrash(), TRASH_RETENTION_DAYS, trashExpiryCutoff()

### Community 8 - "scripts"
Cohesion: 0.15
Nodes (12): name, packageManager, private, scripts, build, dev, lint, start (+4 more)

### Community 10 - "portability.ts"
Cohesion: 0.36
Nodes (7): uploadImage(), folderPath(), noteMarkdown(), PortableFolder, PortableNote, safeFilename(), workspaceZip()

### Community 11 - "credentials.ts"
Cohesion: 0.80
Nodes (3): decryptApiKey(), encryptApiKey(), encryptionKey()

### Community 12 - ".prettierrc.json"
Cohesion: 0.50
Nodes (3): semi, singleQuote, trailingComma

## Knowledge Gaps
- **105 isolated node(s):** `semi`, `singleQuote`, `trailingComma`, `nextConfig`, `name` (+100 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `createClient()` connect `createClient` to `portability.ts`, `createClient`, `app/page.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `getSupabaseEnv()` connect `createClient` to `createClient`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `semi`, `singleQuote`, `trailingComma` to the rest of the system?**
  _105 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
- **Should `markdown-editor.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08866995073891626 - nodes in this community are weakly interconnected._
- **Should `createClient` be split into smaller, more focused modules?**
  _Cohesion score 0.0967741935483871 - nodes in this community are weakly interconnected._