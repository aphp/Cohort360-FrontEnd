import { useState, useEffect } from 'react'

export const useDebounce = (delay: number, value: string): string => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [delay, value])

  return debouncedValue
}

export const debounce = (fn: any, delay: any): ((...args: any) => void) => {
  let timeout: any = -1

  return (...args: any) => {
    if (timeout !== -1) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(fn, delay, ...args)
  }
}
