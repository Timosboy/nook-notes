import { useEffect, useState } from 'react'

type Panels = {
  sidebar: boolean
  list: boolean
}

const STORAGE_KEY = 'notes-panels'

function readPanels(): Panels {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<Panels>
      if (typeof parsed.sidebar === 'boolean' && typeof parsed.list === 'boolean') {
        return { sidebar: parsed.sidebar, list: parsed.list }
      }
    }
  } catch {}

  return { sidebar: window.innerWidth > 1080, list: true }
}

export function usePanels() {
  const [panels, setPanels] = useState(readPanels)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(panels))
    } catch {}
  }, [panels])

  function toggleSidebar() {
    setPanels((current) => ({ ...current, sidebar: !current.sidebar }))
  }

  function toggleList() {
    setPanels((current) => ({ ...current, list: !current.list }))
  }

  function toggleFocus() {
    setPanels((current) => {
      const open = current.sidebar || current.list
      return { sidebar: !open, list: !open }
    })
  }

  function openList() {
    setPanels((current) => current.list ? current : { ...current, list: true })
  }

  return { ...panels, toggleSidebar, toggleList, toggleFocus, openList }
}
