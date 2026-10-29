import { useRef, useState } from 'react'
import { Toast } from '../components/Toast'
import { useShortcut } from '../lib/useShortcut'
import { useToast } from '../lib/useToast'
import { notesApi } from '../notes/api'
import { NotesEmpty, NotesError, NotesLoading } from '../notes/components/NoteStates'
import type { Note, NoteInput } from '../notes/types'
import { useNotes } from '../notes/useNotes'
import { NoteEditor } from './NoteEditor'
import { NoteListPane } from './NoteListPane'
import { Sidebar, type View } from './Sidebar'
import './workspace.css'

const NEW_NOTE_TITLE = 'Untitled'

const VIEW_COPY: Record<View, { title: string; empty: string; emptyText: string }> = {
  active: {
    title: 'Notes',
    empty: 'No notes yet',
    emptyText: 'Your notes will show up here.',
  },
  archived: {
    title: 'Archived',
    empty: 'Nothing archived',
    emptyText: 'Archive notes you want to keep, but out of the way.',
  },
}

const matches = (note: Note, query: string) =>
  `${note.title}\n${note.content}`.toLowerCase().includes(query.trim().toLowerCase())

export function Workspace() {
  const active = useNotes(false)
  const archived = useNotes(true)
  const [view, setView] = useState<View>('active')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [freshId, setFreshId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const { toast, show: showToast, dismiss: dismissToast } = useToast()

  const current = view === 'active' ? active : archived
  const copy = VIEW_COPY[view]
  const visibleNotes = query.trim()
    ? current.notes.filter((note) => matches(note, query))
    : current.notes
  const selected = current.notes.find((note) => note.id === selectedId) ?? null

  function changeView(next: View) {
    setView(next)
    setSelectedId(null)
    setQuery('')
  }

  async function createNote() {
    if (creating) return

    setCreating(true)
    setActionError(null)

    try {
      const note = await notesApi.create({ title: NEW_NOTE_TITLE, content: '' })
      active.upsert(note)
      changeView('active')
      setSelectedId(note.id)
      setFreshId(note.id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  const listFor = (note: Note) => (note.archived ? archived : active)

  async function saveNote(id: string, input: NoteInput) {
    const note = await notesApi.update(id, input)
    listFor(note).upsert(note)
  }

  async function moveNote(note: Note) {
    const moved = note.archived ? await notesApi.unarchive(note.id) : await notesApi.archive(note.id)
    listFor(note).drop(note.id)
    listFor(moved).upsert(moved)
    return moved
  }

  async function toggleArchive(note: Note) {
    setActionError(null)

    try {
      const moved = await moveNote(note)
      setSelectedId(null)
      showToast(moved.archived ? 'Note archived' : 'Note restored', {
        label: 'Undo',
        run: () => void undoMove(moved),
      })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  async function undoMove(note: Note) {
    try {
      const restored = await moveNote(note)
      setView(restored.archived ? 'archived' : 'active')
      setSelectedId(restored.id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  async function deleteNote(id: string) {
    await notesApi.remove(id)
    current.drop(id)
    setSelectedId(null)
  }

  useShortcut('n', () => void createNote())
  useShortcut('/', () => searchRef.current?.focus())

  function renderList() {
    if (current.error) return <NotesError message={current.error} onRetry={current.reload} />
    if (current.loading) return <NotesLoading />

    if (current.notes.length === 0) {
      return <NotesEmpty title={copy.empty} description={copy.emptyText} />
    }

    if (visibleNotes.length === 0) {
      return <NotesEmpty title="No matches" description={`Nothing found for "${query.trim()}".`} />
    }
  }

  return (
    <div className="workspace" data-view={selected ? 'editor' : 'list'}>
      <Sidebar
        view={view}
        counts={{ active: active.notes.length, archived: archived.notes.length }}
        creating={creating}
        onViewChange={changeView}
        onCreate={createNote}
      />

      <NoteListPane
        title={copy.title}
        notes={visibleNotes}
        selectedId={selectedId}
        query={query}
        searchRef={searchRef}
        onQueryChange={setQuery}
        onSelect={setSelectedId}
      >
        {renderList()}
      </NoteListPane>

      <main className="editor-pane">
        {actionError && <NotesError message={actionError} />}
        {selected ? (
          <NoteEditor
            key={selected.id}
            note={selected}
            fresh={selected.id === freshId}
            onSave={(input) => saveNote(selected.id, input)}
            onDelete={() => deleteNote(selected.id)}
            onToggleArchive={() => void toggleArchive(selected)}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <div className="editor-placeholder">
            <p>Pick a note to keep writing, or start a new one.</p>
            <p className="shortcuts">
              <kbd>N</kbd> new note <span aria-hidden="true">·</span> <kbd>/</kbd> search
            </p>
          </div>
        )}
      </main>

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}
