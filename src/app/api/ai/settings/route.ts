import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encryptApiKey, decryptApiKey } from '@/lib/ai/credentials';
import { credentialSchema } from '@/lib/ai/validation';

const providerUrl = (provider: string) => provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : null;

async function authenticatedClient() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { supabase, user, error };
}

export async function GET() {
  const { supabase, user, error } = await authenticatedClient();
  if (error || !user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { data, error: queryError } = await supabase.from('ai_credentials').select('provider, model, updated_at').eq('user_id', user.id).maybeSingle();
  if (queryError) return NextResponse.json({ error: 'Could not load AI settings.' }, { status: 500 });
  return NextResponse.json({ credential: data ? { ...data, configured: true } : null });
}

export async function POST(request: Request) {
  const { supabase, user, error } = await authenticatedClient();
  if (error || !user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const parsed = credentialSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Enter a valid provider, API key and model.' }, { status: 400 });
  try {
    const { provider, apiKey, model } = parsed.data;
    const { error: upsertError } = await supabase.from('ai_credentials').upsert({ user_id: user.id, provider, encrypted_api_key: encryptApiKey(apiKey), model }, { onConflict: 'user_id' });
    if (upsertError) return NextResponse.json({ error: 'Could not save AI settings.' }, { status: 500 });
    return NextResponse.json({ credential: { provider, model, configured: true } });
  } catch {
    return NextResponse.json({ error: 'AI settings are not available on this server.' }, { status: 503 });
  }
}

export async function DELETE() {
  const { supabase, user, error } = await authenticatedClient();
  if (error || !user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { error: deleteError } = await supabase.from('ai_credentials').delete().eq('user_id', user.id);
  if (deleteError) return NextResponse.json({ error: 'Could not delete AI settings.' }, { status: 500 });
  return NextResponse.json({ credential: null });
}

export async function PUT(request: Request) {
  const { supabase, user, error } = await authenticatedClient();
  if (error || !user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const parsed = credentialSchema.pick({ provider: true, apiKey: true, model: true }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Enter a valid provider, API key and model.' }, { status: 400 });
  const { data: stored, error: queryError } = await supabase.from('ai_credentials').select('encrypted_api_key').eq('user_id', user.id).maybeSingle();
  if (queryError || !stored) return NextResponse.json({ error: 'Save your AI settings before testing the connection.' }, { status: 400 });
  try {
    const key = decryptApiKey(stored.encrypted_api_key);
    const url = providerUrl(parsed.data.provider);
    if (!url) return NextResponse.json({ ok: true, message: 'Credentials saved. Connection testing is not available for custom endpoints yet.' });
    const response = await fetch(`${url}/models`, { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(8000), cache: 'no-store' });
    if (!response.ok) return NextResponse.json({ error: 'The provider rejected this API key.' }, { status: 400 });
    return NextResponse.json({ ok: true, message: 'Connection successful.' });
  } catch {
    return NextResponse.json({ error: 'Could not reach the AI provider.' }, { status: 502 });
  }
}
