import { styled, useTheme } from '@mui/material'
import React from 'react'

import CircleBadge from 'components/ui/CircleBadge'

type InfoBadgeProps = {
  size?: number
  className?: string
}

const Glyph = styled('span')({
  fontFamily: 'Georgia, serif',
  fontStyle: 'italic'
})

const InfoBadge = ({ size = 24, className }: InfoBadgeProps) => {
  const theme = useTheme()

  return (
    <CircleBadge color={theme.palette.primary.dark} variant="outlined" size={size} className={className}>
      <Glyph>i</Glyph>
    </CircleBadge>
  )
}

export default InfoBadge
