import { Avatar, styled } from '@mui/material'

type CustomProps = {
  backgroundColor?: string
  bold?: boolean
  color?: string
  fontSize?: number
  marginLeft?: number | string
  marginRight?: number
  size?: number
}

export const AvatarWrapper = styled(Avatar)<CustomProps>(
  ({ backgroundColor = '#5bc5f2', bold, color = '#FFF', fontSize = 14, marginLeft, marginRight, size = 24 }) => ({
    backgroundColor: backgroundColor,
    color: color,
    fontSize: fontSize,
    height: size,
    width: size,
    ...(bold && { fontWeight: 'bold' }),
    ...(marginLeft && { marginLeft: marginLeft }),
    ...(marginRight && { marginRight: marginRight })
  })
)
