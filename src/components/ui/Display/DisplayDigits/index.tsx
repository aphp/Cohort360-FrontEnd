import { Typography } from '@mui/material'
import React from 'react'

import displayDigit from 'utils/displayDigit'
import { DisplayDigitsWrapper } from './styles'

type DisplayDigitsProps = {
  nb: number
  total?: number
  label: string

  color?: string
}

const DisplayDigits = ({ nb, total, label, color = '#153D8A' }: DisplayDigitsProps) => {
  return (
    <DisplayDigitsWrapper color={color} id="DTTB_result">
      <Typography variant="button">
        {displayDigit(nb ?? 0)}
        {total && (
          <>
            <span style={{ color: color, fontSize: 12 }}>/</span> {displayDigit(total ?? 0)}{' '}
          </>
        )}
        <span style={{ color: color, fontSize: 12 }}>&nbsp;{label}</span>
      </Typography>
    </DisplayDigitsWrapper>
  )
}

export default DisplayDigits
