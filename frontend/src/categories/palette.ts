export const PALETTE = [
  { name: 'gray', hex: '#787774' },
  { name: 'red', hex: '#D44C47' },
  { name: 'orange', hex: '#D9730D' },
  { name: 'yellow', hex: '#CB912F' },
  { name: 'green', hex: '#448361' },
  { name: 'teal', hex: '#2B8A8E' },
  { name: 'blue', hex: '#337EA9' },
  { name: 'purple', hex: '#9065B0' },
  { name: 'pink', hex: '#C14C8A' },
  { name: 'brown', hex: '#9F6B53' },
] as const

export function nextColor(used: string[]): string {
  const existing = new Set(used.map((color) => color.toLowerCase()))
  return PALETTE.find(({ hex }) => !existing.has(hex.toLowerCase()))?.hex ?? PALETTE[used.length % PALETTE.length].hex
}
