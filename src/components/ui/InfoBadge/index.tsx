import { styled, useTheme } from '@mui/material'
import React from 'react'

import CircleBadge, { type CircleBadgeVariant } from 'components/ui/CircleBadge'

type InfoBadgeProps = {
  size?: number
  className?: string
  color?: string
  variant?: CircleBadgeVariant
}

const Glyph = styled('span')({
  fontFamily: 'Georgia, serif',
  fontStyle: 'italic'
})

const InfoBadge = ({ size = 24, className, color, variant = 'outlined' }: InfoBadgeProps) => {
  const theme = useTheme()

  return (
    <CircleBadge color={color ?? theme.palette.primary.dark} variant={variant} size={size} className={className}>
      <Glyph>i</Glyph>
    </CircleBadge>
  )
}

export default InfoBadge
