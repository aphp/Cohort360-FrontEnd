import React, { useEffect, useRef, useState } from 'react'
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
  placeholder: string
  onError: (isError: boolean) => void
}

const SearchbarWithCheck = ({
  searchInput,
  setSearchInput,
  loading,
  setLoading,
  placeholder,
  onError
}: SearchbarWithCheckProps) => {
  const controllerRef = useRef<AbortController>(new AbortController())
  const [error, setError] = useState<SearchInputError>({ isError: false })

  const fetchDocumentsList = async () => {
    try {
      setLoading(LoadingStatus.FETCHING)
      const checkResponse = await services.cohorts.checkDocumentSearchInput(searchInput)

      setError(checkResponse)
      if (checkResponse.isError) {
        onError(true)
      } else {
        onError(false)
      }
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
        error={error}
        onchange={(newValue) => setSearchInput(newValue)}
      />
    </SearchbarWithCheckWrapper>
  )
}

export default SearchbarWithCheck
