import { useEffect, useRef, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ease } from '../lib/motion'
import './outline.css'

type Heading = { pos: number, level: number, text: string }

type Props = { editor: Editor | null }

export function OutlineRail({ editor }: Props) {
  const anchor = useRef<HTMLDivElement>(null)
  const [headings, setHeadings] = useState<Heading[]>([])
  const [active, setActive] = useState<number | null>(null)
  const [bounds, setBounds] = useState<{ top: number, left: number, height: number } | null>(null)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!editor) return
    let timer = 0
    function collect() {
      const next: Heading[] = []
      editor!.state.doc.descendants((node, pos) => {
        if (node.type.name !== 'heading' || node.attrs.level > 3) return
        const text = node.textContent.trim().slice(0, 60)
        if (text) next.push({ pos, level: node.attrs.level, text })
      })
      setHeadings((previous) => {
        const same = previous.length === next.length && previous.every((heading, index) => {
          const other = next[index]
          return heading.pos === other.pos && heading.level === other.level && heading.text === other.text
        })
        return same ? previous : next
      })
    }
    function schedule() {
      window.clearTimeout(timer)
      timer = window.setTimeout(collect, 150)
    }
    collect()
    editor.on('update', schedule)
    return () => {
      window.clearTimeout(timer)
      editor.off('update', schedule)
    }
  }, [editor])

  useEffect(() => {
    const pane = anchor.current?.closest<HTMLElement>('.editor-pane')
    const document = pane?.querySelector<HTMLElement>('.document')
    if (!pane || !document || !editor || headings.length < 3) return
    let frame = 0
    function measure() {
      frame = 0
      if (editor!.isDestroyed) return
      const rect = pane!.getBoundingClientRect()
      const page = document!.getBoundingClientRect()
      const top = Math.max(0, rect.top)
      const bottom = Math.min(window.innerHeight, rect.bottom)
      const height = Math.max(0, bottom - top)
      const left = Math.max(rect.left, page.left)
      setBounds((previous) => {
        const next = { top: top + height / 2, left, height }
        return previous?.top === next.top && previous.left === left && previous.height === height ? previous : next
      })
      let position = headings[0].pos
      for (const heading of headings) {
        const node = editor!.view.nodeDOM(heading.pos)
        if (node instanceof HTMLElement && node.getBoundingClientRect().top <= rect.top + 120) position = heading.pos
      }
      if (pane!.scrollHeight > pane!.clientHeight && pane!.scrollTop + pane!.clientHeight >= pane!.scrollHeight - 2) {
        position = headings[headings.length - 1].pos
      }
      setActive((previous) => previous === position ? previous : position)
    }
    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(measure)
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(pane)
    observer.observe(document)
    pane.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('scroll', schedule, { passive: true })
    schedule()
    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      pane.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('scroll', schedule)
    }
  }, [editor, headings])

  function jump(heading: Heading) {
    if (!editor || editor.isDestroyed) return
    const node = editor.view.nodeDOM(heading.pos)
    if (!(node instanceof HTMLElement)) return
    if (editor.isFocused) editor.commands.setTextSelection(heading.pos + 1)
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    node.scrollIntoView({ behavior, block: 'start', inline: 'nearest' })
  }

  return (
    <div ref={anchor} className="outline-anchor">
      {headings.length >= 3 && bounds && (
        <nav
          className="outline-rail"
          aria-label="Outline"
          style={{ top: bounds.top, left: bounds.left + 8, maxHeight: Math.max(0, bounds.height - 144) }}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
          }}
        >
          <div className="outline-dashes">
            {headings.map((heading) => (
              <button
                key={heading.pos}
                type="button"
                className={`outline-dash outline-level-${heading.level}`}
                aria-label={heading.text}
                aria-current={active === heading.pos ? 'true' : undefined}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => jump(heading)}
              >
                <span />
              </button>
            ))}
          </div>
          <AnimatePresence>
            {(hovered || focused) && (
              <motion.div
                className="outline-card-wrap"
                initial={{ opacity: 0, x: reduced ? 0 : -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduced ? 0 : -6 }}
                transition={{ duration: reduced ? 0 : 0.14, ease }}
              >
                <ul className="outline-card">
                  {headings.map((heading) => (
                    <li key={heading.pos}>
                      <button
                        type="button"
                        className={`outline-row outline-level-${heading.level}`}
                        aria-current={active === heading.pos ? 'true' : undefined}
                        onPointerDown={(event) => event.preventDefault()}
                        onClick={() => jump(heading)}
                      >
                        {heading.text}
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      )}
    </div>
  )
}
