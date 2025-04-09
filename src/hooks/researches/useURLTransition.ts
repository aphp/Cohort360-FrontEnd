import { useMemo, useRef } from 'react'

export const useURLTransition = (
  URL: string,
  slideCondition: (prevUrl: string, currentUrl: string) => boolean,
  directionCondition: (prevUrl: string, currentUrl: string) => boolean
) => {
  const prevURL = useRef<string | null>(null)

  const { isActive, direction }: { isActive: boolean; direction: 'left' | 'right' | undefined } = useMemo(() => {
    const prevURLTemp = prevURL.current
    prevURL.current = URL
    if (!prevURLTemp) return { isActive: false, direction: undefined }
    return {
      isActive: slideCondition(prevURLTemp, URL),
      direction: directionCondition(prevURLTemp, URL) ? 'left' : 'right'
    }
  }, [URL, slideCondition, directionCondition])

  return { isActive, direction }
}
