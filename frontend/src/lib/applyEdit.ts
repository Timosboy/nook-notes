export type Edit = { from: number, to: number, insert: string, caret: number }

export function applyEdit(textarea: HTMLTextAreaElement, edit: Edit) {
  textarea.setSelectionRange(edit.from, edit.to)
  const applied = edit.insert
    ? document.execCommand('insertText', false, edit.insert)
    : document.execCommand('delete')

  if (!applied) {
    textarea.setRangeText(edit.insert, edit.from, edit.to, 'end')
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  }

  textarea.setSelectionRange(edit.caret, edit.caret)
}
