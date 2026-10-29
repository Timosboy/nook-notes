import { useId, type KeyboardEvent } from 'react'
import { BookOpenText, Moon, Sun } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { ease } from '../lib/motion'
import { useTheme, type Theme } from '../lib/useTheme'
import './theme.css'

const options: { theme: Theme; label: string; Icon: typeof Sun; turn: number }[] = [
  { theme: 'light', label: 'Light', Icon: Sun, turn: 90 },
  { theme: 'dark', label: 'Night', Icon: Moon, turn: -16 },
  { theme: 'reading', label: 'Reading', Icon: BookOpenText, turn: 0 },
]

const THUMB_SPRING = { type: 'spring', stiffness: 420, damping: 24, mass: 0.9 } as const
const ICON_SPRING = { type: 'spring', stiffness: 300, damping: 18 } as const

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const thumbId = useId()

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
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
    <div
      className="theme-switch"
      role="radiogroup"
      aria-label="Theme"
      data-theme-selected={theme}
      onKeyDown={handleKeyDown}
    >
      {options.map(({ theme: optionTheme, label, Icon, turn }) => {
        const selected = theme === optionTheme

        return (
          <button
            key={optionTheme}
            className="theme-option"
            type="button"
            role="radio"
            aria-label={label}
            aria-checked={selected}
            title={label}
            data-theme-option={optionTheme}
            onClick={() => setTheme(optionTheme)}
          >
            {selected && <motion.span layoutId={thumbId} className="theme-thumb" transition={THUMB_SPRING} />}
            <motion.span
              className="theme-icon"
              animate={{ rotate: selected ? turn : 0, scale: selected ? 1.1 : 1 }}
              transition={ICON_SPRING}
            >
              <Icon size={15} weight="bold" />
            </motion.span>
          </button>
        )
      })}
    </div>
  )
}

export function ThemeCycleButton() {
  const { theme, cycleTheme } = useTheme()
  const CurrentIcon = options.find((option) => option.theme === theme)?.Icon ?? Sun

  return (
    <button
      className="icon-button theme-cycle"
      type="button"
      aria-label="Change theme"
      title="Change theme"
      onClick={cycleTheme}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          className="theme-cycle-icon"
          initial={{ opacity: 0, rotate: -80, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 80, scale: 0.6 }}
          transition={{ duration: 0.16, ease }}
        >
          <CurrentIcon size={16} weight="bold" />
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
