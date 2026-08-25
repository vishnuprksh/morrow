import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAutosaveController } from './autosave';

describe('autosave controller', () => {
  beforeEach(() => { vi.useFakeTimers(); window.localStorage.clear(); });

  it('debounces changes and writes a recovery copy', async () => {
    const save = vi.fn().mockResolvedValue({ status: 'saved', version: 2, updated_at: 'later' });
    const controller = createAutosaveController(save, vi.fn());
    controller.schedule('note-1', { title: 'Draft', content_markdown: 'hello' }, 1);
    await vi.advanceTimersByTimeAsync(799);
    expect(save).not.toHaveBeenCalled();
    expect(window.localStorage.getItem('morrow:note-recovery:note-1')).toContain('hello');
    await vi.advanceTimersByTimeAsync(1);
    await vi.runAllTimersAsync();
    expect(save).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem('morrow:note-recovery:note-1')).toBeNull();
  });

  it('flushes immediately and ignores an older response', async () => {
    let resolveOld!: (value: { status: 'saved'; version: number; updated_at: string }) => void;
    const save = vi.fn()
      .mockReturnValueOnce(new Promise((resolve) => { resolveOld = resolve; }))
      .mockResolvedValueOnce({ status: 'saved', version: 3, updated_at: 'newer' });
    const onResult = vi.fn();
    const controller = createAutosaveController(save, onResult);
    controller.schedule('note-1', { title: 'One', content_markdown: 'one' }, 1);
    const first = controller.flush('note-1');
    controller.schedule('note-1', { title: 'Two', content_markdown: 'two' }, 1);
    const second = controller.flush('note-1');
    resolveOld({ status: 'saved', version: 2, updated_at: 'old' });
    await Promise.all([first, second]);
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(expect.objectContaining({ version: 3, noteId: 'note-1' }));
  });

  it('keeps the recovery copy when the save request fails', async () => {
    const save = vi.fn().mockRejectedValue(new Error('network unavailable'));
    const onResult = vi.fn();
    const controller = createAutosaveController(save, onResult);
    controller.schedule('note-1', { title: 'Offline draft', content_markdown: 'keep me' }, 1);

    const pending = controller.flush('note-1');
    await vi.runAllTimersAsync();
    const result = await pending;

    expect(result).toMatchObject({ status: 'error' });
    expect(onResult).toHaveBeenCalledWith(expect.objectContaining({ status: 'error', noteId: 'note-1' }));
    expect(window.localStorage.getItem('morrow:note-recovery:note-1')).toContain('keep me');
  });

  it('does not save once per keystroke', async () => {
    const save = vi.fn().mockResolvedValue({ status: 'saved', version: 2, updated_at: 'later' });
    const controller = createAutosaveController(save, vi.fn());

    for (const content of ['h', 'he', 'hel', 'hell', 'hello']) {
      controller.schedule('note-1', { title: 'Draft', content_markdown: content }, 1);
      await vi.advanceTimersByTimeAsync(100);
    }

    expect(save).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(800);
    await vi.runAllTimersAsync();
    expect(save).toHaveBeenCalledTimes(1);
  });
});