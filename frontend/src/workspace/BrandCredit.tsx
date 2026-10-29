import { useId } from 'react'
import './brand.css'

function BrandMark({ size }: { size: number }) {
  const clipId = useId().replace(/:/g, '')

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
      <rect x="6" y="8" width="58" height="11" />
      <rect x="29" y="8" width="11" height="84" />
      <clipPath id={clipId}>
        <rect x="40" y="8" width="54" height="84" />
      </clipPath>
      <g clipPath={`url(#${clipId})`} fill="none" stroke="currentColor" strokeWidth="11">
        <path d="M28 72 L100 0" />
        <path d="M57 43 L102 104" />
      </g>
    </svg>
  )
}

export function BrandCredit() {
  return (
    <div className="brand-credit">
      <span className="brand-credit-mark">
        <BrandMark size={20} />
      </span>
      <span className="brand-credit-text">
        <span className="brand-credit-label">Made by</span>
        <span className="brand-credit-name">Timothy Kuno</span>
      </span>
    </div>
  )
}
