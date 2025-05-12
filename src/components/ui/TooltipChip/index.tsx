import React, { ReactElement } from 'react'
import { Box, Tooltip } from '@mui/material'
import StatusChip, { ChipStatus } from '../StatusChip'

type TooltipChipProps = {
  label: string
  status: ChipStatus
  tooltip?: string
  icon?: ReactElement
}

const TooltipChip: React.FC<TooltipChipProps> = ({ label, status, tooltip, icon }) => {
  const statusChip = (
    <Box
      sx={{
        display: 'inline-block',
        pointerEvents: 'auto',
        cursor: 'default'
      }}
    >
      <StatusChip label={label} status={status} icon={icon} />
    </Box>
  )

  return tooltip ? <Tooltip title={tooltip}>{statusChip}</Tooltip> : statusChip
}

export default TooltipChip
