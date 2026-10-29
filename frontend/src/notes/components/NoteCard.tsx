import { formatDate } from '../../lib/format'
import type { Note } from '../types'

type Props = {
  note: Note
}

export function NoteCard({ note }: Props) {
  return (
    <article className="note-card">
      <h2 className="note-title">{note.title}</h2>
      {note.content && <p className="note-content">{note.content}</p>}
      <footer className="note-footer">
        <time className="note-date" dateTime={note.updatedAt}>
          {formatDate(note.updatedAt)}
        </time>
      </footer>
    </article>
  )
}
