import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const presets = {
  improve: 'Improve the writing while preserving the meaning and the writer’s voice.',
  simplify: 'Simplify the language and sentence structure without removing important meaning.',
  shorten: 'Shorten the text while preserving its key meaning and important details.',
  expand: 'Expand the text with useful detail while staying faithful to the original meaning.',
  grammar: 'Fix grammar, spelling, punctuation, and awkward phrasing without changing the meaning.',
} as const;

type Preset = keyof typeof presets;

function isPreset(value: unknown): value is Preset {
  return typeof value === 'string' && value in presets;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const body = await request.json().catch(() => null) as { action?: unknown; selectedText?: unknown; contextBefore?: unknown; contextAfter?: unknown; instruction?: unknown } | null;
  const selectedText = typeof body?.selectedText === 'string' ? body.selectedText : '';
  const action = body?.action;
  const instruction = typeof body?.instruction === 'string' ? body.instruction.trim() : '';
  if (!selectedText.trim() || selectedText.length > 20_000) return NextResponse.json({ error: 'Select between 1 and 20,000 characters.' }, { status: 400 });
  if (!isPreset(action) && !(action === 'custom' && instruction.length > 0 && instruction.length <= 2_000)) return NextResponse.json({ error: 'Choose a valid AI action.' }, { status: 400 });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'The built-in AI agent is not configured on this server.' }, { status: 503 });

  try {
    const openrouter = createOpenAI({ apiKey, baseURL: 'https://openrouter.ai/api/v1' });
    const task = action === 'custom' ? instruction : presets[action];
      const contextBefore = typeof body?.contextBefore === 'string' ? body.contextBefore.slice(-2_000) : '';
      const contextAfter = typeof body?.contextAfter === 'string' ? body.contextAfter.slice(0, 2_000) : '';
    const result = await generateText({
      model: openrouter('openai/gpt-5.6-luna'),
      system: 'You edit selected Markdown in a note. Return only the replacement text, with no explanation, labels, quotation marks, or Markdown code fences. Preserve Markdown syntax when it is part of the selection.',
      prompt: `Task: ${task}\n\nLimited surrounding context (do not rewrite it):\nBefore: ${contextBefore}\nAfter: ${contextAfter}\n\nSelected text to replace:\n${selectedText}`,
      maxOutputTokens: 4_000,
      abortSignal: AbortSignal.timeout(30_000),
    });
    const replacement = result.text.trim();
    if (!replacement) return NextResponse.json({ error: 'The provider returned an empty proposal.' }, { status: 502 });
    return NextResponse.json({ replacement });
  } catch {
    return NextResponse.json({ error: 'The AI provider could not complete this edit.' }, { status: 502 });
  }
}