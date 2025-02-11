import { useState } from 'react'

const useSelectionState = <T,>() => {
  const [selected, setSelected] = useState<T[]>([])

  const toggle = (item: T) => {
    setSelected((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
  }

  const clear = () => {
    setSelected([])
  }

  const selectAll = (items: T[]) => {
    setSelected(items)
  }

  return { selected, setSelected, toggle, clear, selectAll }
}

export default useSelectionState
