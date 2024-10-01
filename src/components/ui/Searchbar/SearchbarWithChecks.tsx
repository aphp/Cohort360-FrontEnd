import React, { useEffect, useRef, useState } from 'react'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { CanceledError } from 'axios'
import { cancelPendingRequest } from 'utils/abortController'
import services from 'services/aphp'
import { SearchInputError } from 'types/error'

type SearchbarWithCheckProps = {
  value: string
  placeholder: string
  radius?: number
  onChange: (searchInput: string) => void
  onError?: (isError: boolean) => void
}

const SearchbarWithCheck = ({ value, radius, placeholder, onChange, onError }: SearchbarWithCheckProps) => {
  const controllerRef = useRef<AbortController>(new AbortController())
  const [error, setError] = useState<SearchInputError>({ isError: false })

  const fetchDocumentsList = async () => {
    try {
      const checkResponse = await services.cohorts.checkDocumentSearchInput(value)
      setError(checkResponse)
      if (onError) {
        if (checkResponse.isError) onError(true)
        else onError(false)
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
  }, [value])

  return (
    <SearchInput
      value={value}
      radius={radius}
      displayHelpIcon
      placeholder={placeholder}
      error={error}
      onChange={(newValue) => onChange(newValue)}
    />
  )
}

export default SearchbarWithCheck
