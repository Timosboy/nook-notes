import { useRef, useState } from 'react'
import { X } from '@phosphor-icons/react'
import { categoriesApi } from '../categories/api'
import { CategoryChip } from '../categories/CategoryChip'
import { CategoryNav } from '../categories/CategoryNav'
import { nextColor, type Category } from '../categories/types'
import { useCategories } from '../categories/useCategories'
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

const hasCategory = (note: Note, id: string) => note.categories.some((category) => category.id === id)

function countByCategory(notes: Note[]) {
  const counts: Record<string, number> = {}

  for (const note of notes) {
    for (const { id } of note.categories) counts[id] = (counts[id] ?? 0) + 1
  }

  return counts
}

const matches = (note: Note, query: string) =>
  `${note.title}\n${note.content}`.toLowerCase().includes(query.trim().toLowerCase())

export function Workspace() {
  const active = useNotes(false)
  const archived = useNotes(true)
  const categories = useCategories()
  const [view, setView] = useState<View>('active')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [freshId, setFreshId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const { toast, show: showToast, dismiss: dismissToast } = useToast()

  const current = view === 'active' ? active : archived
  const copy = VIEW_COPY[view]
  const filter = categories.categories.find(({ id }) => id === categoryId) ?? null
  const visibleNotes = current.notes.filter(
    (note) => (!filter || hasCategory(note, filter.id)) && (!query.trim() || matches(note, query)),
  )
  const categoryCounts = countByCategory(current.notes)
  const selected = current.notes.find((note) => note.id === selectedId) ?? null

  function changeFilter(id: string | null) {
    setCategoryId(id)
    setSelectedId(null)
  }

  async function deleteCategory(category: Category) {
    await categoriesApi.remove(category.id)
    categories.drop(category.id)
    if (categoryId === category.id) setCategoryId(null)
    active.reload()
    archived.reload()
  }

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

  async function toggleCategory(note: Note, category: Category) {
    const tagged = hasCategory(note, category.id)

    try {
      const updated = tagged
        ? await notesApi.removeCategory(note.id, category.id)
        : await notesApi.addCategory(note.id, category.id)
      listFor(updated).upsert(updated)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  async function createCategory(note: Note, name: string) {
    const category = await categoriesApi.create(name, nextColor(categories.categories.length))
    categories.add(category)
    await toggleCategory(note, category)
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
      const description = query.trim()
        ? `Nothing found for "${query.trim()}".`
        : `No notes in ${filter?.name} here yet.`

      return <NotesEmpty title="No matches" description={description} />
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
      >
        <CategoryNav
          categories={categories.categories}
          counts={categoryCounts}
          activeId={categoryId}
          onSelect={changeFilter}
          onDelete={deleteCategory}
        />
      </Sidebar>

      <NoteListPane
        title={copy.title}
        notes={visibleNotes}
        selectedId={selectedId}
        query={query}
        searchRef={searchRef}
        onQueryChange={setQuery}
        onSelect={setSelectedId}
        filter={
          filter && (
            <CategoryChip category={filter}>
              <button
                className="chip-remove"
                aria-label="Clear category filter"
                onClick={() => changeFilter(null)}
              >
                <X size={10} weight="bold" />
              </button>
            </CategoryChip>
          )
        }
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
            categories={categories.categories}
            onToggleCategory={(category) => void toggleCategory(selected, category)}
            onCreateCategory={(name) => createCategory(selected, name)}
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
