import React, { useEffect, useState } from 'react'
import { Grid, InputAdornment, TextField, Typography } from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'
import { ErrorWrapper } from 'components/ui/Searchbar/styles'

type UidTextfieldProps = {
  value: string
  onChange: (value: string) => void
  onError: (isError: boolean) => void
}

const UidTextfield = ({ value, onChange, onError }: UidTextfieldProps) => {
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    const regex = /[^0-9.,]/ //matches everything that isn't a number, a comma or a point

    if (value.match(regex)) {
      setError(true)
      onError(true)
    } else {
      setError(false)
      onError(false)
    }
  }, [value])

  return (
    <>
      <TextField
        placeholder="Ajouter une liste d'uid séparés par des virgules"
        variant="outlined"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        multiline
        minRows={4}
        style={{ width: '100%' }}
        error={error}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end" style={{ padding: '0px 25px' }}>
              {error && <WarningIcon style={{ fill: '#F44336', height: 20 }} />}
            </InputAdornment>
          )
        }}
      />
      {error && (
        <Grid container padding={'10px 0 0'}>
          <ErrorWrapper>
            <Typography style={{ fontWeight: 'bold' }}>
              Des caractères non autorisés ont été détectés dans votre recherche.
            </Typography>
            <Typography>Seuls les chiffres, points, ou les virgules sont autorisés.</Typography>
          </ErrorWrapper>
        </Grid>
      )}
    </>
  )
}

export default UidTextfield
