import { BookOpenText, Moon, Sun } from '@phosphor-icons/react'
import { useTheme, type Theme } from '../lib/useTheme'
import './theme.css'

const options: { theme: Theme; label: string; Icon: typeof Sun }[] = [
  { theme: 'light', label: 'Light', Icon: Sun },
  { theme: 'dark', label: 'Night', Icon: Moon },
  { theme: 'reading', label: 'Reading', Icon: BookOpenText },
]

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const direction = event.key === 'ArrowRight' ? 1 : -1
    const focused = (event.target as HTMLElement).closest<HTMLElement>('[data-theme-option]')
    const index = options.findIndex((option) => option.theme === (focused?.dataset.themeOption ?? theme))
    const next = options[(index + direction + options.length) % options.length]
    setTheme(next.theme)
    document.querySelector<HTMLButtonElement>(`[data-theme-option="${next.theme}"]`)?.focus()
  }

  return (
    <div className="theme-switch" role="radiogroup" aria-label="Theme" onKeyDown={handleKeyDown}>
      {options.map(({ theme: optionTheme, label, Icon }) => (
        <button
          key={optionTheme}
          className="theme-option"
          type="button"
          role="radio"
          aria-label={label}
          aria-checked={theme === optionTheme}
          title={label}
          data-theme-option={optionTheme}
          onClick={() => setTheme(optionTheme)}
        >
          <Icon size={15} weight="bold" />
        </button>
      ))}
    </div>
  )
}

export function ThemeCycleButton() {
  const { theme, cycleTheme } = useTheme()
  const CurrentIcon = options.find((option) => option.theme === theme)?.Icon ?? Sun

  return (
    <button className="icon-button theme-cycle" type="button" aria-label="Change theme" title="Change theme" onClick={cycleTheme}>
      <CurrentIcon size={16} weight="bold" />
    </button>
  )
}
