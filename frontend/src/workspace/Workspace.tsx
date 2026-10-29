import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { X } from '@phosphor-icons/react'
import { categoriesApi } from '../categories/api'
import { CategoryChip } from '../categories/CategoryChip'
import { CategoryNav } from '../categories/CategoryNav'
import { nextColor } from '../categories/palette'
import type { Category } from '../categories/types'
import type { CategoryPatch } from '../categories/api'
import { useCategories } from '../categories/useCategories'
import { Toast } from '../components/Toast'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useShortcut } from '../lib/useShortcut'
import { usePanels } from '../lib/usePanels'
import { useToast } from '../lib/useToast'
import { checkImage } from '../lib/imageRules'
import { markdownToPlain } from '../lib/plainText'
import { notesApi } from '../notes/api'
import { NotesEmpty, NotesError, NotesLoading } from '../notes/components/NoteStates'
import type { Note, NoteImage, NoteInput } from '../notes/types'
import { useNotes } from '../notes/useNotes'
import { Home } from './Home'
import { PanelToggles } from './PanelToggles'
import { Sidebar, type View } from './Sidebar'
import './workspace.css'

const NoteEditor = lazy(() => import('./NoteEditor').then(({ NoteEditor: Component }) => ({ default: Component })))
const NoteListPane = lazy(() => import('./NoteListPane').then(({ NoteListPane: Component }) => ({ default: Component })))

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
  `${note.title}\n${markdownToPlain(note.content)}`.toLowerCase().includes(query.trim().toLowerCase())

export function Workspace() {
  const active = useNotes(false)
  const archived = useNotes(true)
  const categories = useCategories()
  const [view, setView] = useState<View>('active')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [freshId, setFreshId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Note | null>(null)
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [desktop, setDesktop] = useState(() => window.innerWidth > 820)
  const { sidebar, list, toggleSidebar, toggleList, toggleFocus, openList } = usePanels()
  const searchRef = useRef<HTMLInputElement>(null)
  const { toast, show: showToast, dismiss: dismissToast } = useToast()

  useEffect(() => {
    const media = window.matchMedia('(min-width: 821px)')
    const updateDesktop = () => setDesktop(media.matches)
    media.addEventListener('change', updateDesktop)
    return () => media.removeEventListener('change', updateDesktop)
  }, [])

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

  async function createSidebarCategory(name: string, color: string) {
    const category = await categoriesApi.create(name, color)
    categories.add(category)
  }

  async function updateCategory(category: Category, patch: CategoryPatch) {
    const updated = await categoriesApi.update(category.id, patch)
    categories.update(category.id, updated)
    active.reload()
    archived.reload()
  }

  function openNote(note: Note) {
    setView(note.archived ? 'archived' : 'active')
    setSelectedId(note.id)
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

  async function changeEmoji(note: Note, emoji: string | null) {
    try {
      const updated = await notesApi.update(note.id, { emoji })
      listFor(updated).upsert(updated)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  async function addImages(note: Note, files: File[]) {
    let count = note.images.length
    const uploaded: NoteImage[] = []

    for (const file of files) {
      const validation = checkImage(file, count)
      if (validation) {
        showToast(validation)
        continue
      }

      try {
        const image = await notesApi.uploadImage(note.id, file)
        count += 1
        uploaded.push(image)
        listFor(note).patch(note.id, (current) => ({ ...current, images: [...current.images, image] }))
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Something went wrong')
      }
    }

    return uploaded
  }

  function cleanupImages(note: Note, imageIds: string[]) {
    void Promise.all(imageIds.map(async (imageId) => {
      try {
        await notesApi.deleteImage(note.id, imageId)
        listFor(note).patch(note.id, (current) => ({
          ...current,
          images: current.images.filter(({ id }) => id !== imageId),
        }))
      } catch {
        return
      }
    }))
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
    const category = await categoriesApi.create(
      name,
      nextColor(categories.categories.map(({ color }) => color)),
    )
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
      setSelectedId((selectedNoteId) => selectedNoteId === note.id ? null : selectedNoteId)
      showToast(moved.archived ? 'Note archived' : 'Note restored', {
        label: 'Undo',
        run: () => void undoMove(moved),
      })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  async function togglePin(note: Note) {
    setActionError(null)

    try {
      const updated = note.pinned
        ? await notesApi.unpin(note.id)
        : await notesApi.pin(note.id)
      listFor(updated).upsert(updated)
      showToast(updated.pinned ? 'Note pinned' : 'Note unpinned')
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
    active.drop(id)
    archived.drop(id)
    setSelectedId((selectedNoteId) => selectedNoteId === id ? null : selectedNoteId)
  }

  useShortcut('n', () => void createNote())
  useShortcut('[', toggleSidebar)
  useShortcut(']', toggleList)
  useShortcut('\\', toggleFocus)
  useShortcut('/', () => {
    openList()
    window.requestAnimationFrame(() => searchRef.current?.focus())
  })

  const panelToggles = (
    !sidebar && !list ? (
      <PanelToggles
        sidebar={sidebar}
        list={list}
        onToggleSidebar={toggleSidebar}
        onToggleList={toggleList}
      />
    ) : null
  )

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
    <div
      className="workspace"
      data-view={selected ? 'editor' : 'list'}
      data-sidebar={sidebar ? 'open' : 'closed'}
      data-list={list ? 'open' : 'closed'}
    >
      <Sidebar
        inert={desktop && !sidebar}
        view={view}
        counts={{ active: active.notes.length, archived: archived.notes.length }}
        creating={creating}
        sidebarOpen={sidebar}
        listOpen={list}
        onViewChange={changeView}
        onCreate={createNote}
        onHide={toggleSidebar}
        onShowList={toggleList}
      >
        <CategoryNav
          categories={categories.categories}
          counts={categoryCounts}
          activeId={categoryId}
          onSelect={changeFilter}
          onDelete={deleteCategory}
          onCreate={createSidebarCategory}
          onUpdate={updateCategory}
        />
      </Sidebar>

      <Suspense fallback={<section className="list-pane" aria-label={copy.title} />}>
        <NoteListPane
          inert={desktop && !list}
          sidebarOpen={sidebar}
          listOpen={list}
          onHide={toggleList}
          onShowSidebar={toggleSidebar}
          title={copy.title}
          listKey={`${view}:${categoryId ?? 'all'}`}
          notes={visibleNotes}
          selectedId={selectedId}
          query={query}
          searchRef={searchRef}
          onQueryChange={setQuery}
          onSelect={setSelectedId}
          onTogglePin={(note) => void togglePin(note)}
          onToggleArchive={(note) => void toggleArchive(note)}
          onDelete={setDeleting}
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
      </Suspense>

      <main className="editor-pane">
        {actionError && <NotesError message={actionError} />}
        {selected ? (
          <Suspense fallback={null}>
            <NoteEditor
              key={selected.id}
              leading={panelToggles}
              note={selected}
              section={copy.title}
              fresh={selected.id === freshId}
              onSave={(input) => saveNote(selected.id, input)}
              onDelete={() => deleteNote(selected.id)}
              onToggleArchive={() => void toggleArchive(selected)}
              onTogglePin={() => void togglePin(selected)}
              categories={categories.categories}
              onToggleCategory={(category) => void toggleCategory(selected, category)}
              onCreateCategory={(name) => createCategory(selected, name)}
              onAddImages={(files) => addImages(selected, files)}
              onCleanupImages={(imageIds) => cleanupImages(selected, imageIds)}
              onChangeEmoji={(emoji) => void changeEmoji(selected, emoji)}
              onBack={() => setSelectedId(null)}
            />
          </Suspense>
        ) : (
          <Home
            leading={panelToggles}
            notes={active.notes}
            archivedCount={archived.notes.length}
            onOpen={openNote}
            onCreate={() => void createNote()}
            onSearch={() => searchRef.current?.focus()}
          />
        )}
      </main>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this note?"
        description={`"${deleting?.title ?? ''}" will be deleted for good. This can't be undone.`}
        confirmLabel="Delete note"
        onConfirm={async () => {
          if (deleting) await deleteNote(deleting.id)
          setDeleting(null)
        }}
        onClose={() => setDeleting(null)}
      />

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}
