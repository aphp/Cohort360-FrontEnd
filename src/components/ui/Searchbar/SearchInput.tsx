import React, { useEffect, useState } from 'react'

import { IconButton, InputAdornment, InputBase } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'
import { SearchInputWrapper } from './styles'
import { useDebounce } from 'utils/debounce'

type SearchInputProps = {
  placeholder: string
  value: string
  searchOnClick?: boolean
  width: string
  onchange: (value: string) => void
}

const SearchInput = ({ placeholder, value, searchOnClick = false, width, onchange }: SearchInputProps) => {
  const [searchInput, setSearchInput] = useState(value)
  const debouncedSearchValue = useDebounce(500, searchInput)

  useEffect(() => {
    setSearchInput(value)
  }, [value])

  useEffect(() => {
    if (!searchOnClick) onchange(debouncedSearchValue)
  }, [debouncedSearchValue])

  return (
    <SearchInputWrapper width={width}>
      <InputBase
        placeholder={placeholder}
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        endAdornment={
          <InputAdornment position="end" style={{ padding: '0px 15px' }}>
            <IconButton
              style={{ padding: 0 }}
              size="small"
              onClick={() => {
                setSearchInput('')
                onchange('')
              }}
            >
              {searchInput && <ClearIcon />}
            </IconButton>
            {searchOnClick && (
              <IconButton size="small" style={{ padding: 0 }} onClick={() => onchange(searchInput)}>
                <SearchIcon fill="#ED6D91" height="15px" />
              </IconButton>
            )}
          </InputAdornment>
        }
      />
    </SearchInputWrapper>
  )
}

export default SearchInput
