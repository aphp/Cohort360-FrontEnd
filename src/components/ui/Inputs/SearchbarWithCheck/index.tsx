import React, { useEffect, useRef, useState } from 'react'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { CanceledError } from 'axios'
import { cancelPendingRequest } from 'utils/abortController'
import services from 'services/aphp'
import { SearchInputError } from 'types/error'
import { SearchbarWithCheckWrapper } from './styles'

type SearchbarWithCheckProps = {
  searchInput: string
  setSearchInput: (searchInput: string) => void
  placeholder: string
  onError: (isError: boolean) => void
}

const SearchbarWithCheck = ({ searchInput, setSearchInput, placeholder, onError }: SearchbarWithCheckProps) => {
  const controllerRef = useRef<AbortController>(new AbortController())
  const [error, setError] = useState<SearchInputError>({ isError: false })

  const fetchDocumentsList = async () => {
    try {
      const checkResponse = await services.cohorts.checkDocumentSearchInput(searchInput)

      setError(checkResponse)
      if (checkResponse.isError) {
        onError(true)
      } else {
        onError(false)
      }
    } catch (error) {
      if (error instanceof CanceledError) {
        console.error(error)
      }
    }
  }

  useEffect(() => {
    controllerRef.current = cancelPendingRequest(controllerRef.current)
    fetchDocumentsList()
  }, [searchInput])

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
