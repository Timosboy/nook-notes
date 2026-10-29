import type { Edit } from './applyEdit'

export function wrapSelection(value: string, start: number, end: number, marker: string): Edit {
  if (start === end) {
    const insert = marker + marker
    return { from: start, to: end, insert, caret: start + marker.length }
  }

  const selected = value.slice(start, end)
  const before = value.slice(start - marker.length, start)
  const after = value.slice(end, end + marker.length)

  if (before === marker && after === marker) {
    const from = start - marker.length
    const to = end + marker.length
    return { from, to, insert: selected, caret: from + selected.length }
  }

  if (
    selected.length > marker.length * 2
    && selected.startsWith(marker)
    && selected.endsWith(marker)
  ) {
    const insert = selected.slice(marker.length, -marker.length)
    return { from: start, to: end, insert, caret: start + insert.length }
  }

  const insert = marker + selected + marker
  return { from: start, to: end, insert, caret: start + insert.length }
}
