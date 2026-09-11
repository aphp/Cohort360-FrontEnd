import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { styled, useTheme } from '@mui/material'
import React from 'react'

import CircleBadge, { type CircleBadgeVariant } from 'components/ui/CircleBadge'

type InfoBadgeProps = {
  size?: number
  className?: string
  color?: string
  variant?: CircleBadgeVariant
}

const Glyph = styled(InfoOutlinedIcon, { shouldForwardProp: (prop) => prop !== 'badgeSize' })<{ badgeSize: number }>(
  ({ badgeSize }) => ({
    fontSize: Math.round(badgeSize * 0.75)
  })
)

const InfoBadge = ({ size = 24, className, color, variant = 'outlined' }: InfoBadgeProps) => {
  const theme = useTheme()

  return (
    <CircleBadge color={color ?? theme.palette.primary.dark} variant={variant} size={size} className={className}>
      <Glyph badgeSize={size} />
    </CircleBadge>
  )
}

export default InfoBadge
