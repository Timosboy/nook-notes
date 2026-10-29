import { useEffect, useState } from 'react'

export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const activeViewport = viewport

    function updateInset() {
      setInset(Math.max(0, window.innerHeight - activeViewport.height - activeViewport.offsetTop))
    }

    updateInset()
    activeViewport.addEventListener('resize', updateInset)
    activeViewport.addEventListener('scroll', updateInset)

    return () => {
      activeViewport.removeEventListener('resize', updateInset)
      activeViewport.removeEventListener('scroll', updateInset)
    }
  }, [])

  return inset
}
