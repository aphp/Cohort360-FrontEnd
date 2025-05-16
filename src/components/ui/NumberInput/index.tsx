import React, { useEffect, useState } from 'react'
import InputBase, { InputBaseProps } from '@mui/material/InputBase'

type NumberInputProps = InputBaseProps & {
  value: string
  onChange: (newValue: string) => void
}

export const NumberInput = ({ value, onChange, ...otherInputProps }: NumberInputProps) => {
  const [number, setNumber] = useState(value)

  useEffect(() => {
    setNumber(value)
  }, [value])

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue === '' || RegExp(/^\d+$/).exec(newValue)) {
      setNumber(newValue)
      onChange(newValue)
    }
  }

  return <InputBase type="text" value={number} onChange={handleNumberChange} {...otherInputProps} />
}
