import type { Note } from '../types'
import { NoteCard } from './NoteCard'
import './notes.css'

type Props = {
  notes: Note[]
}

export function NoteList({ notes }: Props) {
  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id}>
          <NoteCard note={note} />
        </li>
      ))}
    </ul>
  )
}
