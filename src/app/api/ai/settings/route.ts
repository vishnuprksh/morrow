import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
async function authenticatedClient() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { supabase, user, error };
}

export async function GET() {
  const { user, error } = await authenticatedClient();
  if (error || !user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  return NextResponse.json({
    agent: {
      provider: 'openrouter',
      model: 'inclusionai/ling-3.0-flash-fin:free',
      configured: Boolean(process.env.OPENROUTER_API_KEY),
    },
  });
}
