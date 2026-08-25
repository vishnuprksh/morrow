import { createClient } from '@/lib/supabase/server';

export async function GET(_request: Request, { params }: { params: Promise<{ noteId: string; filename: string }> }) {
  const { noteId, filename } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return new Response('Unauthorized', { status: 401 });
  const { data: note } = await supabase.from('notes').select('id').eq('id', noteId).maybeSingle();
  if (!note) return new Response('Not found', { status: 404 });
  const { data, error } = await supabase.storage.from('attachments').download(`${userData.user.id}/${noteId}/${filename}`);
  if (error || !data) return new Response('Not found', { status: 404 });
  return new Response(data, { headers: { 'Content-Type': data.type || 'application/octet-stream', 'Cache-Control': 'private, max-age=3600' } });
}