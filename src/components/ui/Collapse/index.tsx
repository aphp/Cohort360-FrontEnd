import React, { PropsWithChildren, ReactNode, useState } from 'react'

import { Grid, IconButton, Tooltip, Typography } from '@mui/material'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import InfoIcon from '@mui/icons-material/Info'

import { CollapseWrapper } from './styles'

type CollapseProps = {
  value?: boolean
  title: string
  children: ReactNode
<<<<<<< HEAD
  margin?: string
  info?: React.ReactNode
}

const Collapse = ({ value = true, title, children, margin = '0 0 5px 0', info }: PropsWithChildren<CollapseProps>) => {
=======
}

const Collapse = ({ value = true, title, children }: PropsWithChildren<CollapseProps>) => {
>>>>>>> adf08d4d (fix: fixed some criteria label info - Ref gestion-de-projet#2354)
  const [checked, setChecked] = useState(value)
  console.log('test children', children)

  return (
    <Grid container direction="column">
      <Grid
        item
        container
        direction="row"
        alignItems="center"
        marginBottom={checked ? 2 : 0}
        onClick={() => setChecked(!checked)}
      >
        <Typography style={{ cursor: 'pointer' }} variant="h6">
          {title}
        </Typography>
        {info && (
          <Tooltip title={info}>
            <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
          </Tooltip>
        )}

        <IconButton size="small">
          {checked ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
        </IconButton>
      </Grid>

      <CollapseWrapper in={checked} unmountOnExit>
        {children}
      </CollapseWrapper>
    </Grid>
  )
}

export default Collapse
