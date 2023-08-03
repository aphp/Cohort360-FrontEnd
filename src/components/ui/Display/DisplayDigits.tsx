import { Typography } from '@mui/material'
import React from 'react'

import displayDigit from 'utils/displayDigit'
import { DisplayDigitsWrapper } from './styles'

type DisplayDigitsProps = {
  nb: number
  total: number
  label: string

  color?: string
}

const DisplayDigits = ({ nb, total, label, color = '#153D8A' }: DisplayDigitsProps) => {
  return (
    <DisplayDigitsWrapper color={color} id="DTTB_result">
      <Typography variant="button">
        {/* @ts-ignore */}
        {displayDigit(nb ?? 0)} / {displayDigit(total ?? 0)} {label}
      </Typography>
    </DisplayDigitsWrapper>
  )
}

export default DisplayDigits
