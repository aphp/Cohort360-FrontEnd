import { styled } from '@mui/material'
import type { ReactNode } from 'react'
import React from 'react'

export type CircleBadgeVariant = 'outlined' | 'filled'

type CircleBadgeProps = {
  color: string
  variant?: CircleBadgeVariant
  size?: number
  className?: string
  children: ReactNode
}

const forwarded = ['badgeSize', 'badgeColor', 'badgeVariant']

const Circle = styled('span', { shouldForwardProp: (prop) => !forwarded.includes(prop as string) })<{
  badgeSize: number
  badgeColor: string
  badgeVariant: CircleBadgeVariant
}>(({ badgeSize, badgeColor, badgeVariant }) => ({
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: badgeSize,
  height: badgeSize,
  borderRadius: '50%',
  fontWeight: 700,
  fontSize: Math.round(badgeSize * 0.5),
  lineHeight: 1,
  ...(badgeVariant === 'filled'
    ? { backgroundColor: badgeColor, color: '#FFFFFF' }
    : { border: `${Math.round(badgeSize / 5)}px solid ${badgeColor}`, color: badgeColor })
}))

/** A round badge holding a glyph or a small icon, outlined or filled. */
const CircleBadge = ({ color, variant = 'outlined', size = 24, className, children }: CircleBadgeProps) => (
  <Circle badgeSize={size} badgeColor={color} badgeVariant={variant} className={className}>
    {children}
  </Circle>
)

export default CircleBadge
