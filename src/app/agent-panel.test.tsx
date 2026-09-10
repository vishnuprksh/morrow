import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AgentPanel, extractNoteChangeProposal } from './agent-panel';

const activeNote = {
  id: 'a564e5b2-9498-4a4a-bc42-ba983ec33c4b',
  title: 'Lantern',
  content_markdown: 'Original note',
  folder_id: null,
  version: 4,
};

describe('AgentPanel', () => {
  it('extracts multiline table and animated SVG proposals from a stream', () => {
    const proposal = extractNoteChangeProposal(`Proposing an update.\n${JSON.stringify({
      type: 'note_change_proposal',
      noteId: activeNote.id,
      expectedVersion: activeNote.version,
      original: activeNote.content_markdown,
      replacement: '| Name | Value |\n| --- | --- |\n| pulse | <animate attributeName="r" /> |',
      explanation: 'Add structured content',
      requiresConfirmation: true,
    })}`);

    expect(proposal?.replacement).toContain('| Name | Value |');
    expect(proposal?.replacement).toContain('<animate attributeName="r" />');
  });

  it('keeps note change proposal metadata out of the chat message', async () => {
    const onProposal = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          'I fixed the image syntax.\n{"type":"note_change_proposal","noteId":"a564e5b2-9498-4a4a-bc42-ba983ec33c4b","expectedVersion":4,"original":"Original note","replacement":"Updated note","explanation":"Fix image syntax","requiresConfirmation":true}',
          { headers: { 'Content-Type': 'text/plain' } },
        ),
      ),
    );

    render(
      <AgentPanel
        activeNote={activeNote}
        onClose={vi.fn()}
        onProposal={onProposal}
      />,
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Chat message' }), {
      target: { value: 'Fix the note' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByText('I fixed the image syntax.')).toBeInTheDocument();
    expect(screen.queryByText(/note_change_proposal/)).not.toBeInTheDocument();
    await waitFor(() => expect(onProposal).toHaveBeenCalledOnce());
  });

  it('clears messages and draft input', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Hello there.')));

    render(
      <AgentPanel
        activeNote={activeNote}
        onClose={vi.fn()}
        onProposal={vi.fn()}
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Chat message' });
    fireEvent.change(input, { target: { value: 'Remember this' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText('Hello there.')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Draft text' } });
    fireEvent.click(screen.getByRole('button', { name: 'Clear chat' }));

    expect(screen.getByText('What would you like to do?')).toBeInTheDocument();
    expect(screen.queryByText('Hello there.')).not.toBeInTheDocument();
    expect(input).toHaveValue('');
  });
});
