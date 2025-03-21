import React from 'react'

import Button from 'components/ui/Button'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'

import { Typography } from '@mui/material'

type SublevelButtonProps = {
  label: 'cohorte' | 'échantillon'
  onClick: () => void
  total: number
}

const SublevelButton: React.FC<SublevelButtonProps> = ({ label, onClick, total }) => {
  return (
    <Button
      customVariant="clear"
      disabled={total < 1}
      endIcon={total >= 1 && <ArrowRightAltIcon />}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
    >
      <Typography variant="button" noWrap fontSize={'12px'}>
        {total} {label}
        {total > 1 && 's'}
      </Typography>
    </Button>
  )
}

export default SublevelButton
