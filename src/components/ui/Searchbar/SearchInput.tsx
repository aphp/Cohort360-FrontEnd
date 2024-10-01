import React, { useEffect, useState } from 'react'

import { Grid, IconButton, InputAdornment, InputBase, Typography } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import WarningIcon from '@mui/icons-material/Warning'
import SearchIcon from 'assets/icones/search.svg?react'
import { ErrorWrapper, SearchInputWrapper } from './styles'
import { useDebounce } from 'utils/debounce'
import InfoIcon from '@mui/icons-material/Info'
import DocumentSearchHelp from 'components/ui/Helpers/DocumentSearchHelp'
import { ErrorDetails, SearchInputError } from 'types/error'

type SearchInputProps = {
  placeholder: string
  value: string
  searchOnClick?: boolean
  displayHelpIcon?: boolean
  error?: SearchInputError | null
  disabled?: boolean
  radius?: number
  onChange: (value: string) => void
}

const SearchInput = ({
  placeholder,
  value,
  searchOnClick = false,
  displayHelpIcon = false,
  error = null,
  disabled = false,
  radius,
  onChange
}: SearchInputProps) => {
  const [searchInput, setSearchInput] = useState(value)
  const debouncedSearchValue = useDebounce(500, searchInput)
  const [helpOpen, setHelpOpen] = useState(false)

  useEffect(() => {
    setSearchInput(value)
  }, [value])

  useEffect(() => {
    if (!searchOnClick) onChange?.(debouncedSearchValue)
  }, [debouncedSearchValue])

  return (
    <>
      <SearchInputWrapper error={error?.isError} radius={radius}>
        <InputBase
          disabled={disabled}
          placeholder={placeholder}
          value={searchInput}
          sx={{ color: '#303030' }}
          onChange={(event) => {
            if (!searchInput && event.target.value === ' ') setSearchInput('')
            else setSearchInput(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              onChange(searchInput)
            }
          }}
          endAdornment={
            <InputAdornment position="end" style={{ padding: '0px 25px' }}>
              {error?.isError && <WarningIcon style={{ fill: '#F44336', height: 20 }} />}
              {displayHelpIcon && (
                <IconButton style={{ padding: 2 }} onClick={() => setHelpOpen(true)}>
                  <InfoIcon style={{ height: 22 }} />
                </IconButton>
              )}
              {searchOnClick && (
                <IconButton style={{ padding: 2 }} onClick={() => onChange(searchInput)}>
                  <SearchIcon style={{ fill: '#ED6D91', height: 16 }} />
                </IconButton>
              )}
              {searchInput && (
                <IconButton
                  onClick={() => {
                    setSearchInput('')
                  }}
                  style={{ padding: 2 }}
                >
                  <ClearIcon style={{ fill: '#6f6f6f', height: 18 }} />
                </IconButton>
              )}
            </InputAdornment>
          }
        />

        <DocumentSearchHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
      </SearchInputWrapper>
      {error?.isError && (
        <Grid container>
          <ErrorWrapper>
            <Typography style={{ fontWeight: 'bold' }}>Des erreurs ont été détectées dans votre recherche.</Typography>
            {error?.errorsDetails?.map((detail: ErrorDetails, count: number) => (
              <Typography key={count}>
                {`- ${
                  detail.errorPositions && detail.errorPositions.length > 0
                    ? detail.errorPositions.length === 1
                      ? `Au caractère ${detail.errorPositions[0]} : `
                      : `Aux caractères ${detail.errorPositions.join(', ')} : `
                    : ''
                }
              ${detail.errorName ? `${detail.errorName}.` : ''}
              ${detail.errorSolution ? `${detail.errorSolution}.` : ''}`}
              </Typography>
            ))}
          </ErrorWrapper>
        </Grid>
      )}
    </>
  )
}

export default SearchInput
