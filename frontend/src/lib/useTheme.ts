import { useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'

export type Theme = 'light' | 'dark' | 'reading'
export type Origin = { x: number; y: number }

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

function revealFrom({ x, y }: Origin) {
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

  document.documentElement.animate(
    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
    { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
  )
}

function applyTheme(next: Theme, origin?: Origin) {
  const canAnimate = origin && typeof document.startViewTransition === 'function' && !reducedMotion.matches

  if (!canAnimate) {
    commitTheme(next)
    return
  }

  const root = document.documentElement
  root.classList.add('theme-switching')

  const transition = document.startViewTransition(() => flushSync(() => commitTheme(next)))
  transition.ready.then(() => revealFrom(origin)).catch(() => undefined)
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

  function setTheme(next: Theme, origin?: Origin) {
    if (!isTheme(next)) return
    userChosen = true
    colorScheme.removeEventListener('change', handleColorSchemeChange)
    applyTheme(next, origin)

    try {
      localStorage.setItem('notes-theme', next)
    } catch {
      return
    }
  }

  function cycleTheme(origin?: Origin) {
    const index = themes.indexOf(currentTheme)
    setTheme(themes[(index + 1) % themes.length], origin)
  }

  return { theme: currentTheme, setTheme, cycleTheme }
}
