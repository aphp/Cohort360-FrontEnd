import type React from 'react'
import { styled, keyframes } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Define the shimmer animation
const shimmerAnimation = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`

// Create the styled components using only MUI styling
const BadgeContainer = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: theme.shape.borderRadius,
  background: 'linear-gradient(to right, #d946ef, #0ea5e9)', // Fuchsia to cyan gradient
  padding: '2px 8px',
  position: 'relative',
  overflow: 'hidden',
  minHeight: 20
}))

const ShimmerOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.25), transparent)',
  animation: `${shimmerAnimation} 2s infinite`
})

const BadgeText = styled(Typography)(() => ({
  fontSize: '11px',
  fontWeight: 700,
  color: 'white',
  lineHeight: 1,
  letterSpacing: '0.03em',
  position: 'relative',
  zIndex: 1
}))

interface ShimmerBadgeProps {
  children: React.ReactNode
  sx?: any
}

const ShimmerBadge: React.FC<ShimmerBadgeProps> = ({ children, sx }) => {
  return (
    <BadgeContainer sx={sx}>
      <BadgeText variant="caption">{children}</BadgeText>
      <ShimmerOverlay />
    </BadgeContainer>
  )
}

export default ShimmerBadge
