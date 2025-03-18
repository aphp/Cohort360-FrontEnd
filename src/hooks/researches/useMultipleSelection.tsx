import { useState } from 'react'

const useSelectionState = <T,>() => {
  const [selected, setSelected] = useState<T[]>([])

  const toggle = (item: T) => {
    setSelected((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]))
  }

  const clearSelection = () => {
    setSelected([])
  }

  return { selected, setSelected, toggle, clearSelection }
}

export default useSelectionState
