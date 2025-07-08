import { useEffect, useRef, useState, useMemo } from 'react'

export const useSizeObserver = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number>(0)

  const sizes = useMemo(
    () => ({
      isXS: containerWidth < 600,
      isSM: containerWidth >= 600 && containerWidth < 900,
      isMD: containerWidth >= 900 && containerWidth < 1200,
      isLG: containerWidth >= 1200 && containerWidth < 1535,
      isXL: containerWidth >= 1535
    }),
    [containerWidth]
  )

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])
  return {
    ref: containerRef,
    width: containerWidth,
    sizes
  }
}
