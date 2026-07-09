import { styled } from '@mui/material'
import React from 'react'

type InfoBadgeProps = {
  size?: number
  className?: string
}

const Ring = styled('span', { shouldForwardProp: (prop) => prop !== 'ringSize' })<{ ringSize: number }>(
  ({ theme, ringSize }) => ({
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: ringSize,
    height: ringSize,
    borderRadius: '50%',
    border: `${Math.round(ringSize / 5)}px solid ${theme.palette.primary.dark}`,
    color: theme.palette.primary.dark,
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    fontWeight: 700,
    fontSize: Math.round(ringSize * 0.5),
    lineHeight: 1
  })
)

const InfoBadge = ({ size = 24, className }: InfoBadgeProps) => (
  <Ring ringSize={size} className={className}>
    i
  </Ring>
)

export default InfoBadge
