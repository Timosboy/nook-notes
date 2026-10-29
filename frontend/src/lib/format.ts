const dateFormat = new Intl.DateTimeFormat('en', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const relativeFormat = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY

export const formatDate = (iso: string) => dateFormat.format(new Date(iso))

export function timeAgo(iso: string, now = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000)
  const elapsed = Math.abs(seconds)

  if (elapsed < MINUTE) return 'Just now'
  if (elapsed < HOUR) return relativeFormat.format(Math.round(seconds / MINUTE), 'minute')
  if (elapsed < DAY) return relativeFormat.format(Math.round(seconds / HOUR), 'hour')
  if (elapsed < WEEK) return relativeFormat.format(Math.round(seconds / DAY), 'day')

  return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' })
}
