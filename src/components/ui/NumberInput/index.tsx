import React, { useState } from 'react'
import InputBase, { InputBaseProps } from '@mui/material/InputBase'

type NumberInputProps = InputBaseProps & {
  currentValue: string
  onChangeCurrentValue: (newValue: string) => void
}

export const NumberInput = (props: NumberInputProps) => {
  const [number, setNumber] = useState(props.currentValue)

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? '0' : e.target.value
    if (RegExp(/^\d+$/).exec(newValue)) {
      setNumber(newValue)
      props.onChangeCurrentValue(newValue)
    }
  }

  return <InputBase type="text" value={number} onChange={handleNumberChange} {...props} />
}
