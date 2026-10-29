import { Extension, type ChainedCommands } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import { ReactRenderer } from '@tiptap/react'
import Suggestion, { exitSuggestion, type SuggestionProps } from '@tiptap/suggestion'
import {
  Code, ImageSquare, ListBullets, ListChecks, ListNumbers, Minus,
  Quotes, TextHOne, TextHThree, TextHTwo, TextT, type Icon,
} from '@phosphor-icons/react'
import { SlashMenu } from './SlashMenu'

export type SlashItem = {
  title: string
  description: string
  keywords: string[]
  icon: Icon
  group: 'Basic blocks' | 'Media'
  command?: (chain: ChainedCommands) => ChainedCommands
}

export const slashItems: SlashItem[] = [
  { title: 'Text', description: 'Start writing with plain text', keywords: ['paragraph', 'plain'], icon: TextT, group: 'Basic blocks', command: (chain) => chain.setParagraph() },
  { title: 'Heading 1', description: 'Large section heading', keywords: ['h1', 'title'], icon: TextHOne, group: 'Basic blocks', command: (chain) => chain.setHeading({ level: 1 }) },
  { title: 'Heading 2', description: 'Medium section heading', keywords: ['h2', 'subtitle'], icon: TextHTwo, group: 'Basic blocks', command: (chain) => chain.setHeading({ level: 2 }) },
  { title: 'Heading 3', description: 'Small section heading', keywords: ['h3', 'subtitle'], icon: TextHThree, group: 'Basic blocks', command: (chain) => chain.setHeading({ level: 3 }) },
  { title: 'Bullet list', description: 'Create a simple bulleted list', keywords: ['unordered', 'ul'], icon: ListBullets, group: 'Basic blocks', command: (chain) => chain.toggleBulletList() },
  { title: 'Numbered list', description: 'Create a list with numbering', keywords: ['ordered', 'ol'], icon: ListNumbers, group: 'Basic blocks', command: (chain) => chain.toggleOrderedList() },
  { title: 'To-do list', description: 'Keep track of tasks', keywords: ['todo', 'task', 'checklist'], icon: ListChecks, group: 'Basic blocks', command: (chain) => chain.toggleTaskList() },
  { title: 'Quote', description: 'Highlight a quotation', keywords: ['blockquote', 'citation'], icon: Quotes, group: 'Basic blocks', command: (chain) => chain.toggleBlockquote() },
  { title: 'Code block', description: 'Write a snippet of code', keywords: ['pre', 'snippet'], icon: Code, group: 'Basic blocks', command: (chain) => chain.toggleCodeBlock() },
  { title: 'Divider', description: 'Separate sections with a line', keywords: ['horizontal', 'rule', 'hr'], icon: Minus, group: 'Basic blocks', command: (chain) => chain.setHorizontalRule() },
  { title: 'Image', description: 'Upload an image from your device', keywords: ['photo', 'picture', 'upload'], icon: ImageSquare, group: 'Media' },
]

function matchingItems(query: string) {
  const search = query.trim().toLowerCase()
  return slashItems.filter((item) => [item.title, ...item.keywords].some((word) => word.toLowerCase().includes(search)))
}

const slashKey = new PluginKey('slashCommand')
type MenuProps = SuggestionProps<SlashItem, SlashItem>

export const SLASH_PICK_IMAGE_EVENT = 'slash-pick-image'

export const SlashCommand = Extension.create({
  name: 'slashCommand',
  priority: 1000,

  addProseMirrorPlugins() {
    return [Suggestion<SlashItem, SlashItem>({
      editor: this.editor,
      pluginKey: slashKey,
      char: '/',
      allowedPrefixes: [' '],
      allow: ({ state, range }) => {
        const start = state.doc.resolve(range.from)
        if (start.parent.type.spec.code) return false
        if (start.parentOffset > 0 && state.doc.textBetween(range.from - 1, range.from) !== ' ') return false
        const query = state.doc.textBetween(range.from + 1, range.to)
        return query.length <= 3 || matchingItems(query).length > 0
      },
      items: ({ query }) => matchingItems(query),
      command: ({ editor, range, props: item }) => {
        const chain = editor.chain().focus().deleteRange(range)
        if (item.command) {
          item.command(chain).run()
        } else {
          chain.run()
          document.dispatchEvent(new CustomEvent(SLASH_PICK_IMAGE_EVENT))
        }
      },
      render: () => {
        let renderer: ReactRenderer | null = null
        let current: MenuProps | null = null
        let active = 0
        let observer: ResizeObserver | null = null
        const viewport = window.visualViewport

        const position = () => {
          const rect = current?.clientRect?.()
          const element = renderer?.element
          if (!rect || !element) return
          const left = (viewport?.offsetLeft ?? 0) + 8
          const top = (viewport?.offsetTop ?? 0) + 8
          const right = (viewport?.offsetLeft ?? 0) + (viewport?.width ?? window.innerWidth) - 8
          const bottom = (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight) - 8
          element.style.width = `${Math.max(0, Math.min(288, right - left))}px`
          element.style.maxHeight = `${Math.max(0, Math.min(320, bottom - top))}px`
          const height = element.offsetHeight
          let y = rect.bottom + 4
          if (y + height > bottom) y = rect.top - height - 4
          element.style.left = `${Math.max(left, Math.min(rect.left, right - element.offsetWidth))}px`
          element.style.top = `${Math.max(top, Math.min(y, bottom - height))}px`
        }

        const setActive = (index: number) => {
          active = index
          renderer?.updateProps({ active })
        }

        const choose = (item: SlashItem) => current?.command(item)
        const blur = () => exitSuggestion(this.editor.view, slashKey)

        const cleanup = () => {
          this.editor.off('blur', blur)
          window.removeEventListener('scroll', position, true)
          window.removeEventListener('resize', position)
          viewport?.removeEventListener('resize', position)
          viewport?.removeEventListener('scroll', position)
          observer?.disconnect()
          observer = null
          renderer?.destroy()
          renderer = null
          current = null
        }

        return {
          onStart: (props) => {
            current = props
            active = 0
            renderer = new ReactRenderer(SlashMenu, {
              editor: props.editor,
              className: 'slash-menu',
              props: { items: props.items, active, onActive: setActive, onChoose: choose },
            })
            document.body.appendChild(renderer.element)
            observer = new ResizeObserver(position)
            observer.observe(renderer.element)
            this.editor.on('blur', blur)
            window.addEventListener('scroll', position, true)
            window.addEventListener('resize', position)
            viewport?.addEventListener('resize', position)
            viewport?.addEventListener('scroll', position)
            position()
          },
          onUpdate: (props) => {
            current = props
            active = 0
            renderer?.updateProps({ items: props.items, active })
            position()
          },
          onKeyDown: ({ event }) => {
            if (event.isComposing) return false
            if (event.key === 'Escape') return true
            const items = current?.items ?? []
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              if (items.length) setActive((active + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length)
              return true
            }
            if (event.key === 'Enter' || event.key === 'Tab') {
              if (items[active]) choose(items[active])
              return true
            }
            return false
          },
          onExit: cleanup,
        }
      },
    })]
  },
})
