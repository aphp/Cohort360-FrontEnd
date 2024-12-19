import { useEffect, useMemo, useState } from 'react'
import { TabType } from 'types'
import { Reference } from 'types/valueSet'

export const LIMIT_PER_PAGE = 20

export type SearchParameters = {
  searchInput?: string
  searchMode?: boolean
  page?: number
  limit?: number
  count?: number
  totalPages?: number
  references?: Reference[]
  tabs?: TabType[]
}

export const useSearchParameters = () => {
  const [searchInput, setSearchInput] = useState('')
  const [searchMode, setSearchMode] = useState(false)
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(LIMIT_PER_PAGE)
  const [count, setCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [references, setReferences] = useState<Reference[]>([])
  const [tabs, setTabs] = useState<TabType[]>([])

  const options = useMemo(
    () => ({
      page,
      searchInput,
      searchMode,
      limit,
      count,
      totalPages,
      references,
      tabs
    }),
    [searchInput, page, limit, count, totalPages, searchMode, references, tabs]
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

  const onChangeTabs = (tabs: TabType[]) => {
    setTabs(tabs)
  }

  return {
    options,
    onChangeSearchInput,
    onChangeSearchMode,
    onChangePage,
    onChangeLimit,
    onChangeCount,
    onChangeReferences,
    onChangeTabs
  }
}
