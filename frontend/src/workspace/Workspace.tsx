import { useState } from 'react'
import { notesApi } from '../notes/api'
import { NotesEmpty, NotesError, NotesLoading } from '../notes/components/NoteStates'
import { useNotes } from '../notes/useNotes'
import { NoteListPane } from './NoteListPane'
import { NoteView } from './NoteView'
import { Sidebar } from './Sidebar'
import './workspace.css'

const NEW_NOTE_TITLE = 'Untitled'

export function Workspace() {
  const { notes, loading, error, reload, upsert } = useNotes(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const selected = notes.find((note) => note.id === selectedId) ?? null

  async function createNote() {
    setCreating(true)
    setActionError(null)

    try {
      const note = await notesApi.create({ title: NEW_NOTE_TITLE, content: '' })
      upsert(note)
      setSelectedId(note.id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  function renderList() {
    if (error) return <NotesError message={error} onRetry={reload} />
    if (loading) return <NotesLoading />
    if (notes.length === 0) {
      return <NotesEmpty title="No notes yet" description="Your notes will show up here." />
    }
  }

  return (
    <div className="workspace">
      <Sidebar activeCount={notes.length} creating={creating} onCreate={createNote} />

      <NoteListPane
        title="Notes"
        notes={notes}
        selectedId={selectedId}
        onSelect={setSelectedId}
      >
        {renderList()}
      </NoteListPane>

      <main className="editor-pane">
        {actionError && <NotesError message={actionError} />}
        {selected ? (
          <NoteView note={selected} />
        ) : (
          <div className="editor-placeholder">
            <p>Select a note to read it, or start a new one.</p>
          </div>
        )}
      </main>
    </div>
  )
}
