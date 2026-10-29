import { NoteList } from './notes/components/NoteList'
import { useNotes } from './notes/useNotes'

export default function App() {
  const { notes } = useNotes(false)

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Notes</h1>
      </header>
      <NoteList notes={notes} />
    </div>
  )
}
