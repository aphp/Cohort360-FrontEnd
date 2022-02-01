import React, { useState } from 'react'

import { Button, Grid } from '@material-ui/core'

import InputAgeRangeSlider from './InputAgeRangeSlider'
import InputAgeRangeAdvanced from './InputAgeRangeAdvanced'

type InputAgeRangeProps = {
  birthdates: [string, string]
  onChangeBirthdates: (newAge: [string, string]) => void
}
const InputAgeRange: React.FC<InputAgeRangeProps> = ({ birthdates, onChangeBirthdates }) => {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple')

  console.table('birthdates :>> ', birthdates)

  return (
    <>
      {mode === 'simple' ? (
        <InputAgeRangeSlider birthdates={birthdates} onChangeBirthdates={onChangeBirthdates} />
      ) : (
        <InputAgeRangeAdvanced birthdates={birthdates} onChangeBirthdates={onChangeBirthdates} />
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
