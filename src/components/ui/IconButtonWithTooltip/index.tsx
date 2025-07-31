import React from 'react'
import { Tooltip, IconButton } from '@mui/material'

type IconButtonWithTooltipProps = {
  title: string
  icon: React.ReactElement
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  color?: string
}

const IconButtonWithTooltip: React.FC<IconButtonWithTooltipProps> = ({
  title,
  icon,
  onClick,
  disabled = false,
  color = '#2b2b2b'
}) => {
  return (
    <Tooltip title={title}>
      <span>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            onClick(e)
          }}
          disabled={disabled}
          sx={{
            color: disabled ? '#CBCFCF' : color
          }}
        >
          {React.cloneElement(icon, {
            htmlColor: disabled ? '#CBCFCF' : color
          } as any)}
        </IconButton>
      </span>
    </Tooltip>
  )
}

export default IconButtonWithTooltip
