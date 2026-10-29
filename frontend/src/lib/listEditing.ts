import type { Edit } from './applyEdit'

type ListPrefix = {
  value: string
  kind: 'number' | 'bullet' | 'checkbox' | 'quote'
  number?: number
}

function getListPrefix(line: string): ListPrefix | null {
  const match = /^([ ]*)(?:(\d+)\. |([-*])(?: \[[ xX]\])? |(> ))/.exec(line)

  if (!match) return null

  if (match[2]) {
    return { value: match[0], kind: 'number', number: Number(match[2]) }
  }

  if (match[3]) {
    return {
      value: match[0],
      kind: match[0].includes('[') ? 'checkbox' : 'bullet',
    }
  }

  return { value: match[0], kind: 'quote' }
}

function getLineStart(value: string, position: number): number {
  return position === 0 ? 0 : value.lastIndexOf('\n', position - 1) + 1
}

function getLineEnd(value: string, position: number): number {
  const end = value.indexOf('\n', position)
  return end === -1 ? value.length : end
}

export function continueList(value: string, start: number, end: number): Edit | null {
  if (start !== end) return null

  const lineStart = getLineStart(value, start)
  const lineEnd = getLineEnd(value, start)
  const line = value.slice(lineStart, lineEnd)
  const prefix = getListPrefix(line)

  if (!prefix) return null

  const prefixEnd = lineStart + prefix.value.length
  if (start < prefixEnd) return null

  if (line.length === prefix.value.length && start === lineEnd) {
    return { from: lineStart, to: prefixEnd, insert: '', caret: lineStart }
  }

  let nextPrefix = prefix.value
  if (prefix.kind === 'number') {
    nextPrefix = prefix.value.replace(/\d+/, String((prefix.number ?? 0) + 1))
  } else if (prefix.kind === 'checkbox') {
    nextPrefix = `${prefix.value.match(/^([ ]*)/)?.[0] ?? ''}- [ ] `
  }

  const insert = `\n${nextPrefix}`
  return { from: start, to: start, insert, caret: start + insert.length }
}

export function shiftIndent(
  value: string,
  start: number,
  end: number,
  outdent: boolean,
): Edit | null {
  const firstStart = getLineStart(value, start)
  const lastPosition = start === end ? end : end - 1
  const lastEnd = getLineEnd(value, lastPosition)
  const block = value.slice(firstStart, lastEnd)
  const lines = block.split('\n')

  if (!lines.some((line) => getListPrefix(line))) return null

  const indentChanges = lines.map((line) => {
    if (!outdent) return { line: `  ${line}`, delta: 2 }

    const removed = line.match(/^ {1,2}/)?.[0].length ?? 0
    return { line: line.slice(removed), delta: -removed }
  })
  const insert = indentChanges.map(({ line }) => line).join('\n')
  const caret = start === end
    ? getCollapsedCaret(value, start, firstStart, indentChanges)
    : firstStart + insert.length

  return { from: firstStart, to: lastEnd, insert, caret }
}

function getCollapsedCaret(
  value: string,
  position: number,
  blockStart: number,
  changes: { line: string, delta: number }[],
): number {
  const relativePosition = position - blockStart
  let oldOffset = 0
  let newOffset = 0

  for (const change of changes) {
    const oldLineEnd = oldOffset + change.line.length - change.delta
    if (relativePosition <= oldLineEnd) {
      const linePosition = relativePosition - oldOffset
      return blockStart + newOffset + Math.max(0, linePosition + change.delta)
    }

    oldOffset = oldLineEnd + 1
    newOffset += change.line.length + 1
  }

  return Math.min(value.length, blockStart + newOffset)
}
