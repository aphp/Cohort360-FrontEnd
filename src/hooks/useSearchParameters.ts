import { useEffect, useMemo, useState } from 'react'

export const useSearchParameters = (limit: number, count: number) => {
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(0)
  const [totalPageNumber, setTotalPageNumber] = useState(0)

  const options = useMemo(
    () => ({
      page,
      searchInput
    }),
    [searchInput, page]
  )

  const onChangeSearchInput = (newValue: string) => {
    setSearchInput(newValue)
  }

  const onChangePage = (newValue: number) => {
    setPage(newValue)
  }

  useEffect(() => {
    setTotalPageNumber(Math.floor(count / limit))
  }, [limit, count])

  return {
    options,
    totalPageNumber,
    onChangeSearchInput,
    onChangePage
  }
}
