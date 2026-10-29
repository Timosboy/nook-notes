export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

export function readingMinutes(words: number): number {
  return Math.ceil(words / 200)
}
