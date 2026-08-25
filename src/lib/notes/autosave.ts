export type NoteDraft = {
  title: string;
  content_markdown: string;
};

export type SaveResult =
  | { status: 'saved'; version: number; updated_at: string }
  | { status: 'stale' }
  | { status: 'error'; error: Error };

export type SaveNote = (noteId: string, draft: NoteDraft, expectedVersion: number) => Promise<SaveResult>;
export type AutosaveResult = SaveResult & { noteId: string };

type Entry = {
  draft: NoteDraft;
  version: number;
  timer?: ReturnType<typeof setTimeout>;
  operationId: number;
  flushing?: Promise<SaveResult>;
  flushingOperationId?: number;
};

const RECOVERY_PREFIX = 'morrow:note-recovery:';
const DEBOUNCE_MS = 800;
const MAX_RETRIES = 3;

export function recoveryKey(noteId: string) {
  return `${RECOVERY_PREFIX}${noteId}`;
}

export function readRecoveryCopy(noteId: string): NoteDraft | null {
  try {
    const value = window.localStorage.getItem(recoveryKey(noteId));
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<NoteDraft>;
    return typeof parsed.title === 'string' && typeof parsed.content_markdown === 'string'
      ? { title: parsed.title, content_markdown: parsed.content_markdown }
      : null;
  } catch {
    return null;
  }
}

export function removeRecoveryCopy(noteId: string) {
  try { window.localStorage.removeItem(recoveryKey(noteId)); } catch { /* Storage can be unavailable. */ }
}

function writeRecoveryCopy(noteId: string, draft: NoteDraft) {
  try { window.localStorage.setItem(recoveryKey(noteId), JSON.stringify(draft)); } catch { /* Storage can be unavailable. */ }
}

export function createAutosaveController(saveNote: SaveNote, onResult: (result: AutosaveResult) => void) {
  const entries = new Map<string, Entry>();
  let disposed = false;

  async function attempt(noteId: string, entry: Entry): Promise<SaveResult> {
    for (let retry = 0; retry <= MAX_RETRIES; retry += 1) {
      let result: SaveResult;
      try {
        result = await saveNote(noteId, entry.draft, entry.version);
      } catch (cause) {
        result = {
          status: 'error',
          error: cause instanceof Error ? cause : new Error(String(cause)),
        };
      }
      if (result.status !== 'error' || retry === MAX_RETRIES) return result;
      await new Promise((resolve) => setTimeout(resolve, 100 * 2 ** retry));
    }
    return { status: 'error', error: new Error('Save failed') };
  }

  async function flush(noteId: string): Promise<SaveResult | null> {
    const entry = entries.get(noteId);
    if (!entry) return null;
    if (entry.timer) { clearTimeout(entry.timer); entry.timer = undefined; }
    if (entry.flushing) {
      const pendingOperation = entry.flushing;
      const pendingOperationId = entry.flushingOperationId;
      await pendingOperation;
      const current = entries.get(noteId);
      if (current?.flushing === pendingOperation) current.flushing = undefined;
      return current && current.operationId !== pendingOperationId ? flush(noteId) : pendingOperation;
    }

    const operationId = entry.operationId;
    entry.flushingOperationId = operationId;
    entry.flushing = attempt(noteId, entry).then((result) => {
      const current = entries.get(noteId);
      if (current?.operationId === operationId) {
        if (result.status === 'saved') {
          current.version = result.version;
          removeRecoveryCopy(noteId);
        }
        onResult({ ...result, noteId });
      }
      return result;
    }).finally(() => {
      const current = entries.get(noteId);
      if (current?.operationId === operationId) {
        current.flushing = undefined;
        current.flushingOperationId = undefined;
        if (!current.timer && resultIsComplete(current, operationId)) entries.delete(noteId);
      }
    });
    return entry.flushing;
  }

  function resultIsComplete(entry: Entry, operationId: number) {
    return entry.operationId === operationId;
  }

  return {
    schedule(noteId: string, draft: NoteDraft, version: number) {
      if (disposed) return;
      const existing = entries.get(noteId);
      const entry: Entry = existing ?? { draft, version, operationId: 0 };
      entry.draft = draft;
      if (!existing) entry.version = version;
      entry.operationId += 1;
      if (entry.timer) clearTimeout(entry.timer);
      writeRecoveryCopy(noteId, draft);
      entries.set(noteId, entry);
      entry.timer = setTimeout(() => { entry.timer = undefined; void flush(noteId); }, DEBOUNCE_MS);
    },
    flush,
    cancel(noteId: string) {
      const entry = entries.get(noteId);
      if (entry?.timer) clearTimeout(entry.timer);
      entries.delete(noteId);
    },
    dispose() {
      disposed = true;
      entries.forEach((entry) => { if (entry.timer) clearTimeout(entry.timer); });
      entries.clear();
    },
  };
}

export type AutosaveController = ReturnType<typeof createAutosaveController>;