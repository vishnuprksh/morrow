# Graph Report - haha  (2026-09-09)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 319 nodes · 426 edges · 29 communities (20 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c626734c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- markdown-editor.tsx
- Home
- compilerOptions
- app/page.tsx
- devDependencies
- createClient
- vault-import.ts
- scripts
- portability.ts
- credentials.ts
- trash.ts
- .prettierrc.json
- SettingsPage
- Morrow — AI Markdown Notes
- ai-settings.tsx
- app/layout.tsx
- validation.ts
- AGENTS.md
- next.config.ts
- next-env.d.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 24 edges
2. `Home()` - 24 edges
3. `compilerOptions` - 17 edges
4. `MarkdownEditor()` - 13 edges
5. `createClient()` - 10 edges
6. `importVault()` - 8 edges
7. `scripts` - 8 edges
8. `createAutosaveController()` - 7 edges
9. `getSupabaseEnv()` - 7 edges
10. `safeFilename()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `proxy()` --calls--> `updateSession()`  [EXTRACTED]
  proxy.ts → src/lib/supabase/middleware.ts
- `submit()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/forgot-password/page.tsx → src/lib/supabase/client.ts
- `submit()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/update-password/page.tsx → src/lib/supabase/client.ts
- `submit()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/auth-form.tsx → src/lib/supabase/client.ts
- `archiveNote()` --calls--> `createClient()`  [EXTRACTED]
  src/app/page.tsx → src/lib/supabase/client.ts

## Import Cycles
- None detected.

## Communities (29 total, 9 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.05
Nodes (43): ai, @ai-sdk/openai, jszip, katex, lucide-react, @milkdown/core, @milkdown/plugin-listener, @milkdown/plugin-math (+35 more)

### Community 1 - "markdown-editor.tsx"
Cohesion: 0.07
Nodes (23): AgentPanel(), ChatMessage, NoteContext, EditAction, editActions, ImageSize, imageWidths, MarkdownEditor() (+15 more)

### Community 2 - "Home"
Cohesion: 0.09
Nodes (20): AuthForm(), submit(), SignOutButton(), ForgotPasswordPage(), submit(), UpdatePasswordPage(), submit(), Home() (+12 more)

### Community 3 - "compilerOptions"
Cohesion: 0.06
Nodes (30): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, src/**/*.ts (+22 more)

### Community 4 - "app/page.tsx"
Cohesion: 0.10
Nodes (22): FolderRow, deleteFolder(), moveToTrash(), NoteRow, NoteView, RecoveryNotice(), AutosaveController, AutosaveResult (+14 more)

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

### Community 9 - "portability.ts"
Cohesion: 0.36
Nodes (7): uploadImage(), folderPath(), noteMarkdown(), PortableFolder, PortableNote, safeFilename(), workspaceZip()

### Community 10 - "credentials.ts"
Cohesion: 0.80
Nodes (3): decryptApiKey(), encryptApiKey(), encryptionKey()

### Community 11 - "trash.ts"
Cohesion: 0.70
Nodes (3): isExpiredTrash(), TRASH_RETENTION_DAYS, trashExpiryCutoff()

### Community 12 - ".prettierrc.json"
Cohesion: 0.50
Nodes (3): semi, singleQuote, trailingComma

## Knowledge Gaps
- **111 isolated node(s):** `ChatMessage`, `NoteContext`, `EditAction`, `ImageSize`, `MarkdownEditorProps` (+106 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Home` to `portability.ts`, `app/page.tsx`, `createClient`, `vault-import.ts`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `getSupabaseEnv()` connect `createClient` to `Home`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `ChatMessage`, `NoteContext`, `EditAction` to the rest of the system?**
  _111 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
- **Should `markdown-editor.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06538461538461539 - nodes in this community are weakly interconnected._
- **Should `Home` be split into smaller, more focused modules?**
  _Cohesion score 0.09475806451612903 - nodes in this community are weakly interconnected._