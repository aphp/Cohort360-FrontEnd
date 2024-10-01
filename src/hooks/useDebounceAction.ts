import { useState, useEffect, useCallback } from 'react'

export const useDebounceAction = (callback: (...args: any[]) => void, delay: number) => {
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null)

  const debounced = useCallback(
    (...args: any[]) => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }
      const timeout = setTimeout(() => {
        callback(...args)
      }, delay)

      setDebounceTimeout(timeout)
    },
    [callback, delay, debounceTimeout]
  )
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }
    }
  }, [debounceTimeout])

  return debounced
}
