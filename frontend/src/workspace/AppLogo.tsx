import './brand.css'

export const APP_NAME = 'Nook'

export function AppLogo() {
  return (
    <div className="app-logo">
      <span className="app-logo-tile" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 4.5h6.5L18 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 18.5v-13a1 1 0 0 1 1-1Z" />
          <path className="app-logo-fold" d="M13.5 4.5V9H18" />
          <path className="app-logo-line" d="M9.5 13.5h5M9.5 16.5h3" />
        </svg>
      </span>
      <span className="app-logo-word">
        {APP_NAME}
        <span className="app-logo-dot" aria-hidden="true" />
      </span>
    </div>
  )
}
