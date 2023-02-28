import { useState, useEffect } from 'react'

export const useDebounce = (delay: number, value?: string | boolean) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value])

  return debouncedValue
}

export const debounce = (fn: any, delay: any) => {
  let timeout: any = -1

  return (...args: any) => {
    if (timeout !== -1) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(fn, delay, ...args)
  }
}
