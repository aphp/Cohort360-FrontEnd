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
  info?: React.ReactNode
}

const Collapse = ({ value = true, title, children, info }: PropsWithChildren<CollapseProps>) => {
  const [checked, setChecked] = useState(value)

  return (
    <Grid container sx={{ flexDirection: "column" }}>
      <Grid
        container
        sx={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: checked ? 2 : 0
        }}
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

      <CollapseWrapper in={checked} unmountOnExit sx={{ maxWidth: '100%' }}>
        {children}
      </CollapseWrapper>
    </Grid>
  )
}

export default Collapse
