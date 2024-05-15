import { useEffect, useMemo, useState } from 'react'

export const useSearchParameters = () => {
  const [search, setSearch] = useState('')
  const [searchMode, setSearchMode] = useState(false)
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(20)
  const [count, setCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const options = useMemo(
    () => ({
      page,
      search,
      searchMode,
      limit,
      count,
      totalPages
    }),
    [search, page, limit, count, totalPages, searchMode]
  )

  useEffect(() => {
    setTotalPages(Math.ceil(count / limit))
  }, [count, limit])

  const onChangeLimit = (newValue: number) => {
    setLimit(newValue)
  }

  const onChangeSearchInput = (newValue: string) => {
    setSearch(newValue)
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

  return {
    options,
    onChangeSearchInput,
    onChangeSearchMode,
    onChangePage,
    onChangeLimit,
    onChangeCount
  }
}
