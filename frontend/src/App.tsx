import { useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { notesApi } from './notes/api'
import { NoteForm } from './notes/components/NoteForm'
import { NoteList } from './notes/components/NoteList'
import type { NoteInput } from './notes/types'
import { useNotes } from './notes/useNotes'

export default function App() {
  const { notes, reload } = useNotes(false)
  const [creating, setCreating] = useState(false)

  async function createNote(input: NoteInput) {
    await notesApi.create(input)
    setCreating(false)
    reload()
  }

  async function updateNote(id: string, input: NoteInput) {
    await notesApi.update(id, input)
    reload()
  }

  async function deleteNote(id: string) {
    await notesApi.remove(id)
    reload()
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Notes</h1>
        {!creating && (
          <button className="button button-primary" onClick={() => setCreating(true)}>
            <Plus size={16} weight="bold" />
            New note
          </button>
        )}
      </header>
      {creating && (
        <section className="composer">
          <NoteForm
            submitLabel="Add note"
            onSubmit={createNote}
            onCancel={() => setCreating(false)}
          />
        </section>
      )}
      <NoteList notes={notes} onUpdate={updateNote} onDelete={deleteNote} />
    </div>
  )
}
