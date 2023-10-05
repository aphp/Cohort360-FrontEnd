import { MutableRefObject, RefObject } from 'react'

export const checkIfCardNeedsCollapse = (
  containerRef: MutableRefObject<RefObject<unknown>>,
  itemsRef: MutableRefObject<RefObject<unknown>[]>
): boolean => {
  const element = itemsRef.current
  if (itemsRef.current.length === 0) return false
  // @ts-ignore
  const elemWidth = element ? element.map((e) => e?.current?.offsetWidth ?? 0) : [0, 0]
  const maxWidth = elemWidth.reduce((a, b) => a + b)
  // @ts-ignore
  const containerWidth = containerRef ? containerRef?.current?.offsetWidth : 0
  return maxWidth >= containerWidth
}
