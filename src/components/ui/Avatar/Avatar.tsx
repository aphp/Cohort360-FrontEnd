import React from 'react'
import { Avatar as AvatarMui } from '@mui/material'

type AvatarProps = {
  backgroundColor?: string
  bold?: boolean
  color?: string
  content?: string | number | React.ReactElement
  fontSize?: number
  fontWeight?: string | number
  marginLeft?: number | string
  marginRight?: number
  size?: number
}

const Avatar: React.FC<AvatarProps> = ({
  backgroundColor,
  bold,
  color,
  content,
  fontSize,
  marginLeft,
  marginRight,
  size
}) => {
  return (
    <AvatarMui
      sx={{
        backgroundColor: backgroundColor ?? '#5BC5F2',
        color: color ?? '#FFF',
        fontSize: fontSize ?? 14,
        ...(bold && { fontWeight: 'bold' }),
        ...(marginLeft && { marginLeft: marginLeft }),
        ...(marginRight && { marginRight: marginRight }),
        height: size ?? 24,
        width: size ?? 24
      }}
    >
      {content}
    </AvatarMui>
  )
}

export default Avatar
