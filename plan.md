**# AI Markdown Notes — MVP Build Plan**

**## 1. Product definition**

Build a browser-only, single-user note application with:

- Cloud authentication and database-backed storage

- Folder-based note organization

- Obsidian-style WYSIWYG Markdown editing

- Automatic saving and Markdown portability

- AI actions on selected text

- Note-aware AI agent that can reason over note context and perform approved note actions

- Inline AI autocomplete

- Bring-your-own API key (BYOK)

The MVP is complete when a user can sign in, organize and edit Markdown notes, configure an AI provider securely, use all three AI workflows, and export their notes.

**## 2. Chosen stack**

| Area | Choice |

| --- | --- |

| Language | TypeScript |

| Full-stack framework | Next.js with App Router |

| UI | React, Tailwind CSS, shadcn/ui, Lucide icons |

| Editor | Milkdown with CommonMark/GFM plugins |

| Editor foundation | ProseMirror |

| Authentication | Supabase Auth |

| Database | Supabase PostgreSQL |

| Attachments | Supabase Storage |

| AI orchestration and streaming | Vercel AI SDK with structured tool calling |

| Initial AI provider | OpenAI-compatible endpoint, preferably OpenRouter first |

| Validation | Zod |

| Unit tests | Vitest |

| Browser tests | Playwright |

| Hosting | Vercel + Supabase |

**## 3. Scope boundaries**

**### Included**

- One private workspace per user

- Email/password authentication

- Nested or single-level folders

- Note creation, editing, deletion and movement

- Markdown import and export

- Rich Markdown elements: headings, lists, task lists, links, quotes, code and tables

- Selected-text AI editing with accept/discard preview

- Note-aware sidebar agent with controlled tools for reading, creating and editing notes

- Inline autocomplete accepted with `Tab`

- One OpenAI-compatible provider and model selection

- Encrypted API-key storage

**### Explicitly excluded from the MVP**

- Collaboration and sharing

- Public publishing

- Knowledge graph and backlinks

- Whole-vault embeddings or vector search; the MVP agent uses explicit database retrieval tools

- Autonomous background agents, external integrations and actions outside the note workspace

- Mobile or desktop applications

- Offline-first synchronization

- Version-history UI

- Multiple workspaces

- Billing for AI usage

---

**# Phase 0 — Project foundation**

**## Goal**

Create a stable development foundation before implementing product features.

**## Tasks**

- [ ] Create a Next.js TypeScript project using the App Router.

- [ ] Configure `pnpm` and commit the lockfile.

- [ ] Add Tailwind CSS, shadcn/ui and Lucide icons.

- [ ] Add ESLint or Biome, Prettier if needed, and strict TypeScript settings.

- [ ] Establish the application layout:

  - Left folder/sidebar region

  - Central editor region

  - Collapsible right AI-agent region

- [ ] Create local, preview and production environment-variable templates.

- [ ] Create separate Supabase development and production projects.

- [ ] Add a basic GitHub Actions workflow for linting, type-checking and tests.

- [ ] Configure Vercel preview deployments.

**## Suggested initial structure**

```text

app/

  (auth)/

  (workspace)/

  api/

components/

  editor/

  folders/

  notes/

  agent/

lib/

  ai/

  notes/

  security/

  supabase/

supabase/

  migrations/

tests/

```

**## Acceptance criteria**

- The application starts locally without warnings or TypeScript errors.

- A preview deployment is created automatically from a pull request.

- The three-column application shell works at common desktop browser widths.

- CI rejects lint, type-check and test failures.

---

**# Phase 1 — Authentication and database security**

**## Goal**

Allow users to create private accounts and ensure all data is isolated by user.

**## Tasks**

- [ ] Configure Supabase Auth with email/password authentication.

- [ ] Add sign-up, sign-in, sign-out and password-reset screens.

- [ ] Add protected workspace routes and redirect unauthenticated users.

- [ ] Create the initial database tables:

  - `profiles`

  - `folders`

  - `notes`

  - `ai_credentials`

- [ ] Add foreign keys, timestamps and useful indexes.

- [ ] Add `user_id` ownership to every user-controlled record.

- [ ] Enable Row Level Security on every table.

- [ ] Add policies allowing users to access only their own records.

- [ ] Generate TypeScript database types.

- [ ] Add server-side and browser-side Supabase clients with correct key boundaries.

**## Minimum schema**

```text

folders

  id uuid primary key

  user_id uuid not null

  parent_id uuid nullable

  name text not null

  position integer not null

  created_at timestamptz

  updated_at timestamptz

notes

  id uuid primary key

  user_id uuid not null

  folder_id uuid nullable

  title text not null

  content_markdown text not null default ''

  version integer not null default 1

  created_at timestamptz

  updated_at timestamptz

ai_credentials

  id uuid primary key

  user_id uuid unique not null

  provider text not null

  encrypted_api_key text not null

  model text not null

  created_at timestamptz

  updated_at timestamptz

agent_runs

  id uuid primary key

  user_id uuid not null

  active_note_id uuid nullable

  status text not null

  messages jsonb not null default '[]'

  tool_events jsonb not null default '[]'

  created_at timestamptz

  updated_at timestamptz

```

**## Acceptance criteria**

- A new user can register, sign in, reset a password and sign out.

- Unauthenticated users cannot open workspace routes.

- A user cannot read or mutate another user's folders, notes or AI settings, including by calling the API directly.

- No service-role or secret key is present in the browser bundle.

---

**# Phase 2 — Folder and note management**

**## Goal**

Implement the complete non-editor note-management workflow.

**## Tasks**

- [ ] Build the folder sidebar.

- [ ] Support creating, renaming, deleting and reordering folders.

- [ ] Decide whether nested folders are required immediately; if used, implement `parent_id` and recursive rendering.

- [ ] Build the note list for the selected folder.

- [ ] Support creating, renaming, moving and deleting notes.

- [ ] Add an `Unfiled` view for notes without a folder.

- [ ] Add a deletion confirmation and sensible next-note navigation.

- [ ] Persist the last-opened note locally for convenience.

- [ ] Add loading, empty and error states.

- [ ] Add optimistic UI only for operations with safe rollback behavior.

**## Acceptance criteria**

- A user can create folders and notes, move notes between folders, and delete both safely.

- Refreshing the browser preserves the complete folder and note structure.

- Empty folders and an empty workspace have useful onboarding states.

- Failed operations show an error without leaving the interface in a false state.

---

**# Phase 3 — WYSIWYG Markdown editor**

**## Goal**

Deliver the core writing experience and confirm that Milkdown satisfies the product requirements before adding AI.

**## Tasks**

- [ ] Integrate Milkdown in a client-only editor component.

- [ ] Configure CommonMark and GitHub-Flavored Markdown features.

- [ ] Support:

  - Headings

  - Bold, italic, strike-through and inline code

  - Bulleted, numbered and task lists

  - Blockquotes

  - Links

  - Fenced code blocks

  - Tables

  - Horizontal rules

- [ ] Add a compact formatting toolbar and keyboard shortcuts.

- [ ] Add a slash command only if it does not delay core editing.

- [ ] Load `content_markdown` into Milkdown without HTML being the source of truth.

- [ ] Serialize editor changes back to Markdown.

- [ ] Preserve cursor position during ordinary state updates.

- [ ] Test Markdown round trips with representative fixtures.

- [ ] Add title editing above the document.

**## Markdown round-trip fixtures**

- Nested lists

- Task lists

- Code fences containing Markdown characters

- Tables

- Links containing parentheses

- Inline and block math if math is included

- Mixed bold, italic and inline-code formatting

**## Acceptance criteria**

- A user can write and format a complete note without seeing raw Markdown syntax during normal editing.

- Reloading a note produces the same rendered document.

- Exported Markdown remains readable in Obsidian or another CommonMark-compatible editor.

- The approved round-trip fixtures do not lose content or materially change structure.

**## Checkpoint**

Do not proceed to AI work until this editor prototype feels good. Replace Milkdown with Tiptap only if a concrete blocker is found and documented.

---

**# Phase 4 — Autosave and data resilience**

**## Goal**

Make note editing dependable under refreshes, slow networks, multiple tabs and failed requests.

**## Tasks**

- [ ] Add debounced autosave, initially around 800 ms after the last change.

- [ ] Display `Saving`, `Saved` and `Save failed` states.

- [ ] Flush pending changes when switching notes where possible.

- [ ] Add a `version` field and optimistic concurrency check.

- [ ] Detect stale saves instead of silently overwriting newer content.

- [ ] Keep a temporary browser recovery copy for unsaved Markdown.

- [ ] Restore or offer recovery after a failed save or accidental refresh.

- [ ] Prevent older network responses from overwriting newer edits.

- [ ] Add retry behavior with bounded exponential backoff.

- [ ] Test note switching while a save is in progress.

**## Acceptance criteria**

- Normal typing does not trigger one request per keystroke.

- Refreshing after the `Saved` indicator appears loses no content.

- A delayed older request cannot overwrite a newer note version.

- A simulated network failure preserves a recoverable local copy.

---

**# Phase 5 — Markdown portability and attachments**

**## Goal**

Prevent user lock-in and support basic document assets.

**## Tasks**

- [ ] Export the current note as a `.md` file.

- [ ] Import a `.md` file into a selected folder.

- [ ] Export a folder or workspace as a ZIP containing Markdown and assets.

- [ ] Validate filenames and resolve duplicates safely.

- [ ] Add image upload through Supabase Storage.

- [ ] Support image paste, drag-and-drop and file selection.

- [ ] Store stable attachment references in Markdown.

- [ ] Restrict file type and size.

- [ ] Add storage ownership policies and remove orphaned uploads through a safe cleanup job later.

**## Acceptance criteria**

- An exported note opens correctly in Obsidian or VS Code.

- A normal Markdown file can be imported without losing its text structure.

- Pasted images render after refreshing and are inaccessible to other users.

- The user can export their complete MVP workspace.

---

**# Phase 6 — Secure BYOK settings**

**## Goal**

Allow users to connect their own model account without exposing credentials.

**## Tasks**

- [ ] Start with one OpenAI-compatible provider interface.

- [ ] Support OpenRouter first unless direct OpenAI support is preferred.

- [ ] Build an AI settings screen containing:

  - Provider

  - API key

  - Model identifier

  - Test connection

  - Delete credential

- [ ] Validate fields using Zod.

- [ ] Encrypt keys server-side using AES-256-GCM.

- [ ] Store the encryption master key only in server environment variables.

- [ ] Never return a decrypted credential to the client.

- [ ] Display only a masked credential status after saving.

- [ ] Prevent API keys from appearing in logs, errors or analytics.

- [ ] Rate-limit AI routes per authenticated user.

- [ ] Add provider timeouts and safe error translation.

**## Acceptance criteria**

- A valid key can be saved and tested.

- An invalid or unauthorized key produces a useful error.

- Database inspection shows ciphertext rather than plaintext.

- The browser network inspector never receives the stored plaintext key after it has been saved.

- Deleting the key immediately disables AI features.

---

**# Phase 7 — AI actions on selected text**

**## Goal**

Enable safe, controlled AI rewriting inside the editor.

**## Tasks**

- [ ] Detect non-empty editor selections.

- [ ] Display a floating AI menu near the selection.

- [ ] Include initial actions:

  - Improve writing

  - Simplify

  - Shorten

  - Expand

  - Fix grammar

  - Custom instruction

- [ ] Add `/api/ai/edit` using server-side streaming or generation.

- [ ] Send only the selected text plus limited surrounding context.

- [ ] Return plain replacement Markdown without explanation.

- [ ] Show the proposal in a preview or diff state.

- [ ] Require explicit `Accept` or `Discard`.

- [ ] Preserve the original selection until the action resolves.

- [ ] Support undo after accepting a replacement.

- [ ] Handle a selection changing while a request is in progress.

**## Acceptance criteria**

- Every preset action produces a relevant proposal.

- AI output never replaces text before user acceptance.

- Accepting applies the change exactly once and supports undo.

- Discarding leaves the document unchanged.

- Provider and network errors do not damage the note.

---

**# Phase 8 — Note-aware AI agent**

**## Goal**

Add a streaming agent that understands the active note, can retrieve other user-selected notes when needed, plans multi-step work, and uses controlled tools to act on notes.

**## Tasks**

- [x] Build a collapsible right-side agent panel with conversation, plan and activity views.

- [x] Add `/api/ai/agent` using Vercel AI SDK streaming and structured tool calling.

- [x] Always give the agent the active note title, Markdown, selection and cursor context within token limits.

- [x] Let the user explicitly attach additional notes or a folder as context.

- [x] Implement an initial server-side tool set:

  - `get_active_note`

  - `read_note`

  - `search_notes` using PostgreSQL full-text search

  - `create_note`

  - `replace_selection`

  - `insert_at_cursor`

  - `append_to_note`

  - `update_note`

  - `move_note`

- [x] Keep all tool execution server-side and derive `user_id` from the authenticated session.

- [x] Allow read-only tools to run automatically within the user's workspace.

- [x] Show a write proposal marker and require confirmation before every write tool executes.

- [x] Return tool results to the model so it can continue multi-step tasks and report the final outcome.

- [x] Limit each run by maximum steps, duration, tokens and tool calls; add stop and cancel controls.

- [x] Display a transparent activity trail showing which notes were read and what changes were proposed or applied.

- [ ] Reject stale writes with the note `version` field and regenerate or rebase the proposal after conflicts.

- [x] Persist minimal agent runs and tool events so a refresh does not hide what the agent changed.

- [x] Add context-size handling for long notes through bounded content and explicit retrieval.

- [x] Defend against prompt injection inside notes: note content is untrusted data and cannot override system rules, permissions or confirmation requirements.

**## Acceptance criteria**

- The agent can answer questions about the active note and complete a multi-step note task.

- The agent can find relevant notes with explicit retrieval tools without receiving another user's content.

- Read operations are visible, and no note mutation occurs before the user approves its preview.

- Approved changes execute once, support ordinary editor undo where applicable, and fail safely on version conflicts.

- Cancelling or exceeding a run limit stops further model and tool execution.

- Long notes fail gracefully rather than exceeding model limits unexpectedly.

---

**# Phase 9 — Inline AI autocomplete**

**## Goal**

Provide low-friction, cancellable continuation suggestions while typing.

**## Prototype first**

Implement this phase as a narrow technical prototype before polishing its UI. It is the highest-risk MVP feature.

**## Tasks**

- [ ] Create a Milkdown/ProseMirror autocomplete plugin.

- [ ] Trigger only when:

  - The user pauses for roughly 600–900 ms

  - The cursor is collapsed

  - Enough preceding context exists

  - No selection menu or agent write action is active

- [ ] Send bounded text before and after the cursor to `/api/ai/complete`.

- [ ] Render suggestions as grey ghost text using a ProseMirror decoration.

- [ ] Accept with `Tab`.

- [ ] Dismiss with `Escape`.

- [ ] Cancel pending requests when the user resumes typing, changes notes or moves the cursor.

- [ ] Reject stale responses using a request ID and document-version check.

- [ ] Add a user setting to disable autocomplete.

- [ ] Add a minimum interval and maximum completion length to control API cost.

- [ ] Avoid triggering inside code blocks, links and other unsuitable nodes initially.

**## Acceptance criteria**

- Suggestions never become document content without explicit acceptance.

- Typing remains responsive while requests are running.

- A stale response never appears in the wrong cursor position or note.

- `Tab`, `Escape`, continued typing and note switching behave predictably.

- Autocomplete can be disabled completely.

**## Fallback**

If continuous autocomplete is not stable enough for the MVP, ship a manual `Continue writing` action bound to a keyboard shortcut and keep ghost-text autocomplete behind an experimental flag.

---

**# Phase 10 — Quality, security and accessibility**

**## Goal**

Make the MVP safe and dependable enough for real personal notes.

**## Tasks**

- [ ] Add unit tests for:

  - Markdown transformations

  - Encryption and decryption

  - Prompt construction

  - Autosave ordering

  - Input validation

- [ ] Add Playwright tests for:

  - Sign-up and sign-in

  - Folder and note CRUD

  - Editing and autosave

  - Markdown import/export

  - AI-key setup using a mocked provider

  - Selection editing

  - Agent retrieval, confirmation and note mutation

  - Autocomplete acceptance and cancellation

- [ ] Test RLS policies with two independent users.

- [ ] Add security headers and a restrictive Content Security Policy.

- [ ] Sanitize or disallow unsafe raw HTML in Markdown.

- [ ] Add request-size limits and rate limiting.

- [ ] Add keyboard navigation and visible focus states.

- [ ] Label interactive controls for screen readers.

- [ ] Add structured, secret-free server logs.

- [ ] Add an error boundary and useful failure screens.

- [ ] Test Chrome, Edge, Firefox and Safari where available.

**## Acceptance criteria**

- Critical end-to-end tests pass in CI.

- Cross-user access attempts fail.

- No API key or note content is unintentionally written to logs.

- The core workflow is usable with a keyboard.

- Supported desktop browsers pass a documented smoke-test checklist.

---

**# Phase 11 — Deployment and MVP release**

**## Goal**

Deploy a production-ready MVP and validate the real workflow with a small group.

**## Tasks**

- [ ] Apply production database migrations.

- [ ] Configure production authentication URLs and email templates.

- [ ] Configure Vercel environment variables.

- [ ] Set the production encryption secret and document rotation limitations.

- [ ] Configure a custom domain and HTTPS.

- [ ] Add basic privacy and data-export information.

- [ ] Add a first-run onboarding note demonstrating Markdown and AI actions.

- [ ] Create a backup and restore procedure for the database.

- [ ] Add error monitoring without capturing private note content.

- [ ] Run the complete production smoke test.

- [ ] Invite 5–10 users and observe their first-use workflow.

- [ ] Collect feedback on editor quality, AI usefulness, latency and trust.

**## Acceptance criteria**

- A new production user can complete the full workflow without developer assistance.

- Notes remain available after signing out and back in.

- Export works before the MVP is announced.

- AI failures are recoverable and never damage note content.

- A documented database restore path exists.

---

**# Testing strategy**

**## Unit tests**

Use for deterministic behavior:

- Markdown serialization

- Encryption helpers

- Prompt construction

- Autosave state machine

- Validation schemas

**## Integration tests**

Use for boundaries:

- Supabase queries and RLS

- AI-route authentication

- Credential decryption and provider creation

- Storage upload policies

**## End-to-end tests**

Use for essential user journeys:

1. Register and sign in.

2. Create a folder and note.

3. Write formatted content and wait for autosave.

4. Refresh and confirm the content.

5. Configure a mocked AI provider.

6. Rewrite selected text and accept it.

7. Ask the agent to research the active note, find a related note and propose an update.

8. Review and approve the proposed write, then verify the activity trail.

9. Accept and dismiss autocomplete suggestions.

10. Export the note as Markdown.

---

**# Recommended milestone sequence**

| Milestone | Phases | Demonstrable outcome |

| --- | --- | --- |

| M1: Private note shell | 0–2 | User can sign in and manage folders and notes |

| M2: Reliable editor | 3–5 | User can edit, autosave, import/export and use images |

| M3: BYOK AI editing | 6–7 | User can securely connect a model and rewrite selections |

| M4: Note-aware agent | 8 | Agent can retrieve context and perform approved, auditable note actions |

| M5: AI-native writing | 9 | User can accept inline continuation suggestions |

| M6: MVP release | 10–11 | Tested and deployed product ready for early users |

---

**# Definition of done**

The MVP is done when all of the following are true:

- [ ] Users can create accounts and access only their own data.

- [ ] Folders and notes work reliably across browser refreshes.

- [ ] Notes are edited visually while stored as portable Markdown.

- [ ] Autosave prevents silent loss and detects stale writes.

- [ ] Users can import and export their Markdown.

- [ ] API keys are encrypted and never returned after storage.

- [ ] Selected-text editing requires acceptance.

- [ ] The agent uses only authorized note context and exposes which notes it reads.

- [ ] Every agent write is previewed, explicitly approved, version-checked and recorded.

- [ ] Inline autocomplete is stable or ships behind an experimental flag with `Continue writing` as the fallback.

- [ ] Critical security and end-to-end tests pass.

- [ ] The production system has backups, monitoring and a verified export path.

---

**# Post-MVP backlog**

Only consider these after real usage confirms the core editor and AI workflows:

- Full-text search

- Backlinks and `[[wiki links]]`

- Note graph

- Whole-workspace semantic search and RAG

- Semantic retrieval across the entire workspace using embeddings

- Background and scheduled agent runs

- External agent tools such as web search, calendar, email and task managers

- Version history and restore UI

- Offline support and PWA installation

- Collaboration and sharing

- Public publishing

- Additional native AI providers

- Templates and daily notes

- Command palette

- Obsidian-vault ZIP import

- Mobile applications
