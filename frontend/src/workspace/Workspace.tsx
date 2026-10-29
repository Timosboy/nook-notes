import { useRef, useState } from 'react'
import { useShortcut } from '../lib/useShortcut'
import { notesApi } from '../notes/api'
import { NotesEmpty, NotesError, NotesLoading } from '../notes/components/NoteStates'
import type { Note, NoteInput } from '../notes/types'
import { useNotes } from '../notes/useNotes'
import { NoteEditor } from './NoteEditor'
import { NoteListPane } from './NoteListPane'
import { Sidebar } from './Sidebar'
import './workspace.css'

const NEW_NOTE_TITLE = 'Untitled'

const matches = (note: Note, query: string) =>
  `${note.title}\n${note.content}`.toLowerCase().includes(query.trim().toLowerCase())

export function Workspace() {
  const { notes, loading, error, reload, upsert, drop } = useNotes(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [freshId, setFreshId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const visibleNotes = query.trim() ? notes.filter((note) => matches(note, query)) : notes
  const selected = notes.find((note) => note.id === selectedId) ?? null

  async function createNote() {
    if (creating) return

    setCreating(true)
    setActionError(null)

    try {
      const note = await notesApi.create({ title: NEW_NOTE_TITLE, content: '' })
      upsert(note)
      setQuery('')
      setSelectedId(note.id)
      setFreshId(note.id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  async function saveNote(id: string, input: NoteInput) {
    upsert(await notesApi.update(id, input))
  }

  async function deleteNote(id: string) {
    await notesApi.remove(id)
    drop(id)
    setSelectedId(null)
  }

  useShortcut('n', () => void createNote())
  useShortcut('/', () => searchRef.current?.focus())

  function renderList() {
    if (error) return <NotesError message={error} onRetry={reload} />
    if (loading) return <NotesLoading />

    if (notes.length === 0) {
      return <NotesEmpty title="No notes yet" description="Your notes will show up here." />
    }

    if (visibleNotes.length === 0) {
      return <NotesEmpty title="No matches" description={`Nothing found for "${query.trim()}".`} />
    }
  }

  return (
    <div className="workspace">
      <Sidebar activeCount={notes.length} creating={creating} onCreate={createNote} />

      <NoteListPane
        title="Notes"
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
    </div>
  )
}
