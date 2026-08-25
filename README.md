# Morrow — AI Markdown Notes

## Local setup

1. Create a Supabase project and enable email/password authentication.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the publishable/anon key is safe for browser use; never use a service-role key here).
3. Apply `supabase/migrations/20260825000000_initial_schema.sql` using the Supabase SQL editor or Supabase CLI.
4. Add `http://localhost:3000/auth/update-password` to Supabase Auth redirect URLs.
5. Run `pnpm dev`.

Phase 1 includes email/password sign-up, sign-in, sign-out, password reset, protected workspace routing, user-owned schema, and Row Level Security policies. Database TypeScript types are in `src/lib/supabase/database.types.ts`.

Phase 5 adds Markdown note import, single-note `.md` export, workspace ZIP export, and private image attachments. Apply `supabase/migrations/20260825010000_attachments.sql` after the initial migration. Attachments are stored under each user's ID and are served only through an authenticated note-scoped route.
