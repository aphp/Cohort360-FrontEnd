import React, { PropsWithChildren, ReactNode, useState } from 'react'

import { Grid, IconButton, Typography } from '@mui/material'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { CollapseWrapper } from './styles'

type CollapseProps = {
  value?: boolean
  title: string
  children: ReactNode
}

const Collapse = ({ value = true, title, children }: PropsWithChildren<CollapseProps>) => {
  const [checked, setChecked] = useState(value)

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
