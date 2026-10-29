import { useEffect, useRef, useState } from 'react'

export type SaveStatus = 'saved' | 'saving' | 'error'

type Options = {
  delay?: number
  enabled?: boolean
}

export function useAutosave<T>(
  value: T,
  save: (value: T) => Promise<unknown>,
  { delay = 600, enabled = true }: Options = {},
) {
  const [status, setStatus] = useState<SaveStatus>('saved')
  const key = JSON.stringify(value)
  const savedKey = useRef(key)
  const pendingKey = useRef<string | null>(null)
  const saveRef = useRef(save)

  useEffect(() => {
    saveRef.current = save
  })

  useEffect(() => {
    if (!enabled || key === savedKey.current) {
      pendingKey.current = null
      return
    }

    pendingKey.current = key

    const timer = setTimeout(() => {
      pendingKey.current = null
      setStatus('saving')

      saveRef
        .current(JSON.parse(key) as T)
        .then(() => {
          savedKey.current = key
          setStatus('saved')
        })
        .catch(() => setStatus('error'))
    }, delay)

    return () => clearTimeout(timer)
  }, [key, enabled, delay])

  useEffect(
    () => () => {
      if (pendingKey.current) {
        saveRef.current(JSON.parse(pendingKey.current) as T).catch(() => undefined)
      }
    },
    [],
  )

  return status
}
