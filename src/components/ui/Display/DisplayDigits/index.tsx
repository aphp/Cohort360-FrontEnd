import { Typography } from '@mui/material'
import React, { useMemo } from 'react'
import { DisplayDigitsWrapper } from './styles'
import { format } from 'utils/numbers'

type DisplayDigitsProps = {
  nb: number
  total?: number
  label: string
  color?: string
}

const DisplayDigits = ({ nb, total, label, color = '#153D8A' }: DisplayDigitsProps) => {
  const formattedNb = useMemo(() => format(nb), [nb])
  const formattedTotal = useMemo(() => format(total), [total])

  return (
    <DisplayDigitsWrapper color={color} id={`digit-${label}`}>
      <Typography fontWeight={700} fontSize={14}>
        {[formattedNb, total && `/ ${formattedTotal}`, label].filter(Boolean).join(' ')}
      </Typography>
    </DisplayDigitsWrapper>
  )
}

export default DisplayDigits
