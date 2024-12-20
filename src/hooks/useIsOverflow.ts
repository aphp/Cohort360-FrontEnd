import React, { MutableRefObject, useLayoutEffect, useState } from 'react'

type UseIsOverflowArgs = {
  ref: MutableRefObject<HTMLDivElement | null>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalDependencies?: Record<string, any>
}

export const useIsOverflow = ({ ref, additionalDependencies }: UseIsOverflowArgs) => {
  const [isOverflow, setIsOverflow] = useState<boolean | undefined>(undefined)

  useLayoutEffect(() => {
    const { current } = ref

    if (!current) return

    const checkOverflow = () => {
      const hasOverflow = current.scrollHeight > current.clientHeight
      setIsOverflow(hasOverflow)
    }
    checkOverflow()

    // this is used to monitor size changes
    const resizeObserver = new ResizeObserver(() => checkOverflow())
    resizeObserver.observe(current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [ref, additionalDependencies])

  return isOverflow
}
