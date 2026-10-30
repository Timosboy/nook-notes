import { Check, ClockCounterClockwise, Tag } from '@phosphor-icons/react'

const ROWS = [
  { emoji: '🗄️', title: 'Databases: indexes and transactions', meta: 'School', tone: 'purple' },
  { emoji: '📞', title: 'Call with Marta: onboarding flow', meta: 'Work', tone: 'yellow' },
]

const TASKS = [
  { text: 'Book the train to Aguas Calientes', done: true },
  { text: 'Machu Picchu tickets, morning slot', done: true },
  { text: 'Cash in soles', done: false },
]

export function AuthPreview() {
  return (
    <aside className="auth-preview" aria-hidden="true">
      <div className="auth-preview-stage">
        <ul className="preview-list">
          {ROWS.map((row) => (
            <li key={row.title} className="preview-row">
              <span className="preview-row-title"><span>{row.emoji}</span>{row.title}</span>
              <span className={`preview-chip tone-${row.tone}`}>{row.meta}</span>
            </li>
          ))}
        </ul>

        <article className="preview-note">
          <span className="preview-outline">
            <span className="is-active" />
            <span />
            <span />
          </span>
          <span className="preview-emoji">🏔️</span>
          <h2 className="preview-title">Trip to Cusco</h2>
          <dl className="preview-properties">
            <div>
              <dt><Tag size={14} weight="bold" />Categories</dt>
              <dd><span className="preview-chip tone-blue">Travel</span></dd>
            </div>
            <div>
              <dt><ClockCounterClockwise size={14} weight="bold" />Last edited</dt>
              <dd>Just now <span className="preview-saved">Saved</span></dd>
            </div>
          </dl>
          <h3 className="preview-heading">Before leaving</h3>
          <ul className="preview-tasks">
            {TASKS.map((task) => (
              <li key={task.text} className={task.done ? 'is-done' : undefined}>
                <span className="preview-check">{task.done && <Check size={11} weight="bold" />}</span>
                {task.text}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </aside>
  )
}
