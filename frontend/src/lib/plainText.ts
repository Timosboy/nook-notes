export function markdownToPlain(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/^```[^\n]*\n?|```$/g, ''))
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s*(?:#{1,6}\s+|[-*+]\s+(?:\[[ xX]\]\s+)?|\d+\.\s+|>\s?)/gm, '')
    .replace(/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/gm, '')
    .replace(/(\*\*|__|~~)(.*?)\1/g, '$2')
    .replace(/([*_])([^*_]+)\1/g, '$2')
    .replace(/\\([\\`*_{}\x5B\x5D()#+.!>~-])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}
