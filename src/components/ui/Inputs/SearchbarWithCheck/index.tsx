import React, { useEffect, useRef } from 'react'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { LoadingStatus } from 'types'
import { CanceledError } from 'axios'
import { cancelPendingRequest } from 'utils/abortController'
import services from 'services/aphp'
import { SearchInputError } from 'types/error'
import { SearchbarWithCheckWrapper } from './styles'

type SearchbarWithCheckProps = {
  searchInput: string
  setSearchInput: (searchInput: string) => void
  loading: LoadingStatus
  setLoading: (loading: LoadingStatus) => void
  searchInputError: SearchInputError | undefined
  setSearchInputError: (searchInputError: SearchInputError | undefined) => void
  placeholder: string
}

const SearchbarWithCheck = ({
  searchInput,
  setSearchInput,
  loading,
  setLoading,
  searchInputError,
  setSearchInputError,
  placeholder
}: SearchbarWithCheckProps) => {
  const controllerRef = useRef<AbortController>(new AbortController())

  const fetchDocumentsList = async () => {
    try {
      setLoading(LoadingStatus.FETCHING)
      const checkResponse = await services.cohorts.checkDocumentSearchInput(searchInput)

      setSearchInputError(checkResponse)
      setLoading(LoadingStatus.SUCCESS)
    } catch (error) {
      if (error instanceof CanceledError) {
        setLoading(LoadingStatus.SUCCESS)
      }
    }
  }

  useEffect(() => {
    setLoading(LoadingStatus.IDDLE)
  }, [searchInput])

  useEffect(() => {
    if (loading === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      fetchDocumentsList()
    }
  }, [loading])

  return (
    <SearchbarWithCheckWrapper>
      <SearchInput
        value={searchInput}
        displayHelpIcon
        placeholder={placeholder}
        error={searchInputError?.isError ? searchInputError : undefined}
        onchange={(newValue) => setSearchInput(newValue)}
      />
    </SearchbarWithCheckWrapper>
  )
}

export default SearchbarWithCheck
