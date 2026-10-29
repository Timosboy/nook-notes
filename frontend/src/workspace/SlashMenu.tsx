import { Fragment, useEffect, useRef } from 'react'
import type { SlashItem } from './slashCommand'
import './slashmenu.css'

type Props = {
  items: SlashItem[]
  active: number
  onActive: (index: number) => void
  onChoose: (item: SlashItem) => void
}

export function SlashMenu({ items, active, onActive, onChoose }: Props) {
  const menu = useRef<HTMLDivElement>(null)

  useEffect(() => {
    menu.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active, items])

  return (
    <div ref={menu} role="listbox" aria-label="Block types" onMouseDown={(event) => event.preventDefault()}>
      {!items.length && <div className="slash-menu-empty" role="status">No results</div>}
      {items.map((item, index) => (
        <Fragment key={item.title}>
          {items[index - 1]?.group !== item.group && <div className="slash-menu-heading">{item.group}</div>}
          <button
            type="button"
            role="option"
            aria-selected={active === index}
            className={`slash-menu-item${active === index ? ' is-active' : ''}`}
            tabIndex={-1}
            onMouseEnter={() => onActive(index)}
            onClick={() => onChoose(item)}
          >
            <span className="slash-menu-icon"><item.icon size={18} weight="bold" /></span>
            <span className="slash-menu-copy">
              <span className="slash-menu-title">{item.title}</span>
              <span className="slash-menu-description">{item.description}</span>
            </span>
          </button>
        </Fragment>
      ))}
    </div>
  )
}
