import { useId, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Eye, EyeSlash, Sparkle, WarningCircle } from '@phosphor-icons/react'
import { AppLogo } from '../workspace/AppLogo'
import { BrandCredit } from '../workspace/BrandCredit'
import { ThemeSwitch } from '../workspace/ThemeSwitch'
import { ease } from '../lib/motion'
import { startSession, type Session } from '../lib/session'
import { authApi, DEMO_ACCOUNT } from './api'
import { AuthPreview } from './AuthPreview'
import './auth.css'

type Mode = 'login' | 'register'

const COPY: Record<Mode, { eyebrow: string, title: string, lead: string, submit: string, busy: string, prompt: string, switchLabel: string }> = {
  login: {
    eyebrow: 'Sign in',
    title: 'Welcome back.',
    lead: 'Pick up your notes where you left them.',
    submit: 'Sign in',
    busy: 'Signing in',
    prompt: 'New to Nook?',
    switchLabel: 'Create an account',
  },
  register: {
    eyebrow: 'Create account',
    title: 'A quiet place for your notes.',
    lead: 'Write, sort and find your notes. Your account keeps them private.',
    submit: 'Create account',
    busy: 'Creating account',
    prompt: 'Already have an account?',
    switchLabel: 'Sign in',
  },
}

type Props = { expired?: boolean }

export function AuthScreen({ expired = false }: Props) {
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState<'form' | 'demo' | null>(null)
  const [error, setError] = useState<string | null>(expired ? 'Your session ended. Sign in again to continue.' : null)
  const ids = useId()
  const copy = COPY[mode]

  async function run(kind: 'form' | 'demo', action: () => Promise<Session>) {
    setPending(kind)
    setError(null)
    try {
      startSession(await action())
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong')
      setPending(null)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    if (mode === 'login') void run('form', () => authApi.login(email.trim(), password))
    else void run('form', () => authApi.register(name.trim(), email.trim(), password))
  }

  function switchMode() {
    setMode(mode === 'login' ? 'register' : 'login')
    setError(null)
    setShowPassword(false)
  }

  return (
    <div className="auth">
      <header className="auth-top">
        <AppLogo />
        <ThemeSwitch />
      </header>

      <main className="auth-main">
        <section className="auth-panel" aria-labelledby={`${ids}-title`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              className="auth-stack"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease }}
            >
              <p className="auth-eyebrow">{copy.eyebrow}</p>
              <h1 id={`${ids}-title`} className="auth-title">{copy.title}</h1>
              <p className="auth-lead">{copy.lead}</p>

              <form className="auth-form" onSubmit={handleSubmit}>
                {mode === 'register' && (
                  <label className="auth-field">
                    <span className="auth-label">Name</span>
                    <input
                      className="auth-input"
                      type="text"
                      name="name"
                      autoComplete="name"
                      required
                      maxLength={60}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </label>
                )}
                <label className="auth-field">
                  <span className="auth-label">Email</span>
                  <input
                    className="auth-input"
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    maxLength={254}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
                <label className="auth-field">
                  <span className="auth-label">
                    Password
                    {mode === 'register' && <span className="auth-hint">At least 8 characters</span>}
                  </span>
                  <span className="auth-password">
                    <input
                      className="auth-input"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      required
                      minLength={mode === 'register' ? 8 : undefined}
                      maxLength={72}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                    <button
                      type="button"
                      className="icon-button auth-reveal"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeSlash size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
                    </button>
                  </span>
                </label>

                <AnimatePresence initial={false}>
                  {error && (
                    <motion.p
                      className="auth-error"
                      role="alert"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18, ease }}
                    >
                      <WarningCircle size={16} weight="bold" />
                      <span>{error}</span>
                    </motion.p>
                  )}
                </AnimatePresence>

                <button className="button button-primary auth-submit" type="submit" disabled={pending !== null}>
                  {pending === 'form' ? `${copy.busy}...` : copy.submit}
                  {pending !== 'form' && <ArrowRight size={15} weight="bold" />}
                </button>
              </form>

              {mode === 'login' && (
                <>
                  <div className="auth-divider"><span>or</span></div>
                  <button
                    className="button auth-demo"
                    type="button"
                    disabled={pending !== null}
                    onClick={() => void run('demo', () => authApi.login(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password))}
                  >
                    <Sparkle size={15} weight="bold" />
                    {pending === 'demo' ? 'Opening the demo...' : 'Try the demo account'}
                  </button>
                </>
              )}

              <p className="auth-switch">
                {copy.prompt}{' '}
                <button type="button" className="auth-link" onClick={switchMode}>{copy.switchLabel}</button>
              </p>
            </motion.div>
          </AnimatePresence>
        </section>

        <AuthPreview />
      </main>

      <footer className="auth-footer">
        <BrandCredit />
      </footer>
    </div>
  )
}
