import React, { useState } from 'react'

import { Button, Grid } from '@material-ui/core'

import InputAgeRangeSlider from './InputAgeRangeSlider'
import InputAgeRangeAdvanced from './InputAgeRangeAdvanced'

type InputAgeRangeProps = {
  birthdates: [string, string]
  onChangeBirthdates: (newAge: [string, string]) => void
  error: boolean
  setError: (error: boolean) => void
}
const InputAgeRange: React.FC<InputAgeRangeProps> = ({ birthdates, onChangeBirthdates, error, setError }) => {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple')

  return (
    <>
      {mode === 'simple' ? (
        <InputAgeRangeSlider
          birthdates={birthdates}
          onChangeBirthdates={onChangeBirthdates}
          error={error}
          setError={setError}
        />
      ) : (
        <InputAgeRangeAdvanced
          birthdates={birthdates}
          onChangeBirthdates={onChangeBirthdates}
          error={error}
          setError={setError}
        />
      )}

      <Grid container justifyContent="flex-end">
        <Button onClick={() => setMode(mode === 'simple' ? 'advanced' : 'simple')}>
          {mode === 'simple' ? 'Mode avancé' : 'Mode simple'}
        </Button>
      </Grid>
    </>
  )
}

export default InputAgeRange
