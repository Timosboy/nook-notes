import { useSyncExternalStore } from 'react'

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

function applyTheme(next: Theme) {
  theme = next
  document.documentElement.dataset.theme = next
  updateThemeColor(next)
  subscribers.forEach((subscriber) => subscriber())
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
