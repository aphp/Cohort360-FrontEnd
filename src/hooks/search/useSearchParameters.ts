import { useEffect, useMemo, useState } from 'react'
import { Reference } from 'types/searchValueSet'

export const useSearchParameters = () => {
  const [searchInput, setSearchInput] = useState('')
  const [searchMode, setSearchMode] = useState(false)
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(20)
  const [count, setCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [references, setReferences] = useState<Reference[]>([])

  const options = useMemo(
    () => ({
      page,
      searchInput,
      searchMode,
      limit,
      count,
      totalPages,
      references
    }),
    [searchInput, page, limit, count, totalPages, searchMode, references]
  )

  useEffect(() => {
    setTotalPages(Math.ceil(count / limit))
  }, [count, limit])

  const onChangeLimit = (newValue: number) => {
    setLimit(newValue)
  }

  const onChangeSearchInput = (newValue: string) => {
    setSearchInput(newValue)
  }

  const onChangePage = (newValue: number) => {
    setPage(newValue)
  }

  const onChangeCount = (newValue: number) => {
    setCount(newValue)
  }

  const onChangeSearchMode = (newValue: boolean) => {
    setSearchMode(newValue)
  }

    const onChangeReferences = (references: Reference[]) => {
      setReferences(references)
    }

  return {
    options,
    onChangeSearchInput,
    onChangeSearchMode,
    onChangePage,
    onChangeLimit,
    onChangeCount,
    onChangeReferences
  }
}
