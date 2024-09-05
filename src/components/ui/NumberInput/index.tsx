import React, { useEffect, useState } from 'react'
import InputBase, { InputBaseProps } from '@mui/material/InputBase'

type NumberInputProps = InputBaseProps & {
  currentvalue: string
  onChangeCurrentValue: (newValue: string) => void
}

export const NumberInput = (props: NumberInputProps) => {
  const [number, setNumber] = useState(props.currentvalue)

  useEffect(() => {
    setNumber(props.currentvalue)
  }, [props.currentvalue])

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue === '' || RegExp(/^\d+$/).exec(newValue)) {
      setNumber(newValue)
      props.onChangeCurrentValue(newValue)
    }
  }

  return <InputBase type="text" value={number} onChange={handleNumberChange} {...props} />
}
