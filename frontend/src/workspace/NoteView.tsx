import { formatDate } from '../lib/format'
import type { Note } from '../notes/types'

type Props = {
  note: Note
}

export function NoteView({ note }: Props) {
  return (
    <article className="document">
      <time className="document-date" dateTime={note.updatedAt}>
        {formatDate(note.updatedAt)}
      </time>
      <h2 className="document-title">{note.title}</h2>
      <p className="document-body">{note.content}</p>
    </article>
  )
}
