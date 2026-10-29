import type { Note, NoteInput } from '../types'
import { NoteCard } from './NoteCard'
import './notes.css'

type Props = {
  notes: Note[]
  onUpdate: (id: string, input: NoteInput) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function NoteList({ notes, onUpdate, onDelete }: Props) {
  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id}>
          <NoteCard
            note={note}
            onUpdate={(input) => onUpdate(note.id, input)}
            onDelete={() => onDelete(note.id)}
          />
        </li>
      ))}
    </ul>
  )
}
