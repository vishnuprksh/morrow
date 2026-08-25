# Graph Report - haha  (2026-08-25)

## Corpus Check
- Corpus is ~6,783 words - fits in a single context window. You may not need a graph.

## Summary
- 188 nodes · 173 edges · 51 communities (12 shown, 39 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Project Configuration
- Authentication Flow
- Frontend Dependencies
- TypeScript Configuration
- Package Scripts
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 13
- Community 14
- Community 15
- Community 16
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 17 edges
2. `createClient()` - 16 edges
3. `Home()` - 9 edges
4. `scripts` - 8 edges
5. `getSupabaseEnv()` - 7 edges
6. `include` - 7 edges
7. `AuthForm()` - 4 edges
8. `Database` - 4 edges
9. `updateSession()` - 4 edges
10. `lib` - 4 edges

## Surprising Connections (you probably didn't know these)
- `proxy()` --calls--> `updateSession()`  [EXTRACTED]
  proxy.ts → src/lib/supabase/middleware.ts
- `submit()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/auth-form.tsx → src/lib/supabase/client.ts
- `submit()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/forgot-password/page.tsx → src/lib/supabase/client.ts
- `submit()` --calls--> `createClient()`  [EXTRACTED]
  src/app/auth/update-password/page.tsx → src/lib/supabase/client.ts
- `updateNote()` --calls--> `createClient()`  [EXTRACTED]
  src/app/page.tsx → src/lib/supabase/client.ts

## Import Cycles
- None detected.

## Communities (51 total, 39 thin omitted)

### Community 0 - "Project Configuration"
Cohesion: 0.07
Nodes (27): eslint, eslint-config-next, jsdom, devDependencies, eslint, eslint-config-next, jsdom, postcss (+19 more)

### Community 1 - "Authentication Flow"
Cohesion: 0.12
Nodes (16): AuthForm(), submit(), SignOutButton(), ForgotPasswordPage(), submit(), UpdatePasswordPage(), submit(), FolderRow (+8 more)

### Community 2 - "Frontend Dependencies"
Cohesion: 0.08
Nodes (25): ai, @ai-sdk/openai, lucide-react, next, dependencies, ai, @ai-sdk/openai, lucide-react (+17 more)

### Community 3 - "TypeScript Configuration"
Cohesion: 0.10
Nodes (21): dom, dom.iterable, esnext, vitest/globals, compilerOptions, allowJs, esModuleInterop, incremental (+13 more)

### Community 4 - "Package Scripts"
Cohesion: 0.15
Nodes (12): name, packageManager, private, scripts, build, dev, lint, start (+4 more)

### Community 5 - "Community 5"
Cohesion: 0.31
Nodes (7): config, proxy(), Database, Json, getSupabaseEnv(), updateSession(), createClient()

### Community 6 - "Community 6"
Cohesion: 0.20
Nodes (9): .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, src/**/*.ts, src/**/*.tsx, vitest.config.ts, exclude (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.50
Nodes (3): semi, singleQuote, trailingComma

## Knowledge Gaps
- **104 isolated node(s):** `semi`, `singleQuote`, `trailingComma`, `nextConfig`, `name` (+99 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Project Configuration` to `Package Scripts`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Frontend Dependencies` to `Package Scripts`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **What connects `semi`, `singleQuote`, `trailingComma` to the rest of the system?**
  _104 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Project Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `Authentication Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.12307692307692308 - nodes in this community are weakly interconnected._
- **Should `Frontend Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `TypeScript Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._