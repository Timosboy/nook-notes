import { useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'

export type Theme = 'light' | 'dark' | 'reading'

const themes: Theme[] = ['light', 'dark', 'reading']
const themeColors: Record<Theme, string> = {
  light: '#fbfbfa',
  dark: '#191919',
  reading: '#f4ecd8',
}

let theme = (document.documentElement.dataset.theme as Theme) || 'light'
let userChosen = false
const subscribers = new Set<() => void>()
const colorScheme = window.matchMedia('(prefers-color-scheme: dark)')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark' || value === 'reading'
}

try {
  userChosen = isTheme(localStorage.getItem('notes-theme'))
} catch {
  userChosen = false
}

function updateThemeColor(next: Theme) {
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', themeColors[next])
}

function commitTheme(next: Theme) {
  theme = next
  document.documentElement.dataset.theme = next
  updateThemeColor(next)
  subscribers.forEach((subscriber) => subscriber())
}

const DISSOLVE_OPTIONS = { duration: 750, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'both' } as const

function dissolve() {
  const root = document.documentElement

  root.animate(
    { filter: ['blur(0px)', 'blur(7px)'], transform: ['scale(1)', 'scale(1.012)'] },
    { ...DISSOLVE_OPTIONS, pseudoElement: '::view-transition-old(root)' },
  )
  root.animate(
    { opacity: [0, 1], filter: ['blur(9px)', 'blur(0px)'], transform: ['scale(1.012)', 'scale(1)'] },
    { ...DISSOLVE_OPTIONS, pseudoElement: '::view-transition-new(root)' },
  )
}

function applyTheme(next: Theme) {
  const canAnimate = typeof document.startViewTransition === 'function' && !reducedMotion.matches

  if (!canAnimate) {
    commitTheme(next)
    return
  }

  const root = document.documentElement
  root.classList.add('theme-switching')

  const transition = document.startViewTransition(() => flushSync(() => commitTheme(next)))
  transition.ready.then(dissolve).catch(() => undefined)
  transition.finished.finally(() => root.classList.remove('theme-switching'))
}

function handleColorSchemeChange(event: MediaQueryListEvent) {
  if (!userChosen) applyTheme(event.matches ? 'dark' : 'light')
}

if (!userChosen) colorScheme.addEventListener('change', handleColorSchemeChange)

function subscribe(subscriber: () => void) {
  subscribers.add(subscriber)
  return () => subscribers.delete(subscriber)
}

function getSnapshot() {
  return theme
}

export function useTheme() {
  const currentTheme = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  function setTheme(next: Theme) {
    if (!isTheme(next)) return
    userChosen = true
    colorScheme.removeEventListener('change', handleColorSchemeChange)
    applyTheme(next)

    try {
      localStorage.setItem('notes-theme', next)
    } catch {
      return
    }
  }

  function cycleTheme() {
    const index = themes.indexOf(currentTheme)
    setTheme(themes[(index + 1) % themes.length])
  }

  return { theme: currentTheme, setTheme, cycleTheme }
}
