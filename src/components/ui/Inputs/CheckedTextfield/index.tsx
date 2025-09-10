import React, { useCallback, useEffect, useState } from 'react'
import { Grid, InputAdornment, TextField, Typography } from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'
import { ErrorWrapper } from 'components/ui/Searchbar/styles'

type CheckedTextfieldProps = {
  value: string
  regex: string
  errorMessage?: string
  placeholder?: string
  multiline?: boolean
  inverseCheck?: boolean
  extractValidValues?: boolean
  displayCheckError?: boolean
  onChange: (value: string) => void
  onError: (isError: boolean) => void
}

const CheckedTextfield = ({
  value,
  onChange,
  onError,
  errorMessage,
  regex,
  placeholder,
  inverseCheck = false,
  displayCheckError = true,
  extractValidValues = false,
  multiline = false
}: CheckedTextfieldProps) => {
  const [error, setError] = useState<boolean>(false)
  const [bufferValue, setBufferValue] = useState<string>(value)

  const extractValue = useCallback((value: string, regex: string) => {
    const regexp = new RegExp(regex, 'gm')
    const matches = value.matchAll(regexp)
    const extractedValues = []
    for (const match of matches) {
      if (match) {
        extractedValues.push(match[1])
      }
    }
    return extractedValues
  }, [])

  useEffect(() => {
    const regexp = new RegExp(regex, 'gm')

    if (!bufferValue || !!regexp.exec(bufferValue) === !inverseCheck) {
      setError(false)
      onError(false)
      if (extractValidValues && !inverseCheck) {
        onChange(extractValue(bufferValue, regex).join(','))
      } else {
        onChange(bufferValue)
      }
    } else {
      if (extractValidValues && !inverseCheck) {
        onChange(extractValue(bufferValue, regex).join(','))
      }
      setError(true)
      onError(true)
    }
    // only bufferValue can change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bufferValue, extractValue])

  return (
    <>
      <TextField
        placeholder={placeholder}
        variant="outlined"
        value={bufferValue}
        multiline={multiline}
        onChange={(event) => setBufferValue(event.target.value)}
        minRows={4}
        style={{ width: '100%' }}
        error={displayCheckError && error}
        slotProps={{
          input: {
            ...(displayCheckError
              ? {
                  endAdornment: (
                    <InputAdornment position="end" style={{ padding: '0px 25px' }}>
                      {error && <WarningIcon style={{ fill: '#F44336', height: 20 }} />}
                    </InputAdornment>
                  )
                }
              : {})
          }
        }}
      />
      {displayCheckError && error && (
        <Grid container padding={'10px 0 0'}>
          <ErrorWrapper>
            <Typography style={{ fontWeight: 'bold' }}>
              Des caractères non autorisés ont été détectés dans votre recherche.
            </Typography>
            {errorMessage && <Typography>{errorMessage}</Typography>}
          </ErrorWrapper>
        </Grid>
      )}
    </>
  )
}

export default CheckedTextfield
