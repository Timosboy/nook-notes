import { useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { notesApi } from './notes/api'
import { NoteForm } from './notes/components/NoteForm'
import { NoteList } from './notes/components/NoteList'
import { NotesEmpty, NotesError, NotesLoading } from './notes/components/NoteStates'
import type { NoteInput } from './notes/types'
import { useNotes } from './notes/useNotes'

export default function App() {
  const { notes, loading, error, reload } = useNotes(false)
  const [creating, setCreating] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  async function run(action: () => Promise<unknown>) {
    setActionError(null)

    try {
      await action()
      reload()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  async function createNote(input: NoteInput) {
    await notesApi.create(input)
    setCreating(false)
    reload()
  }

  async function updateNote(id: string, input: NoteInput) {
    await notesApi.update(id, input)
    reload()
  }

  const deleteNote = (id: string) => run(() => notesApi.remove(id))

  function renderNotes() {
    if (error) return <NotesError message={error} onRetry={reload} />
    if (loading) return <NotesLoading />

    if (notes.length === 0) {
      return (
        <NotesEmpty
          title="No notes yet"
          description="Write down an idea, a to-do or anything you want to keep."
          action={
            !creating && (
              <button className="button button-primary" onClick={() => setCreating(true)}>
                <Plus size={16} weight="bold" />
                Write your first note
              </button>
            )
          }
        />
      )
    }

    return <NoteList notes={notes} onUpdate={updateNote} onDelete={deleteNote} />
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Notes</h1>
          {!loading && !error && (
            <p className="page-meta">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </p>
          )}
        </div>
        {!creating && (
          <button className="button button-primary" onClick={() => setCreating(true)}>
            <Plus size={16} weight="bold" />
            New note
          </button>
        )}
      </header>
      {actionError && <NotesError message={actionError} />}
      {creating && (
        <section className="composer">
          <NoteForm
            submitLabel="Add note"
            onSubmit={createNote}
            onCancel={() => setCreating(false)}
          />
        </section>
      )}
      {renderNotes()}
    </div>
  )
}
