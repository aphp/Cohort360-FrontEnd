import React, { PropsWithChildren } from 'react'
import { CircularProgress, Grid, IconButton, Tooltip, Typography } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import WarningIcon from '@mui/icons-material/Warning'
import { styled } from '@mui/material/styles'

type ChartProps = {
  id?: string
  isLoading?: boolean
  title?: string
  tooltip?: string
  warningTooltip?: string
  height?: number | string
}

const ChartContainer = styled(Grid)(() => ({
  backgroundColor: '#FFF',
  padding: 16,
  margin: 8,
  borderRadius: 8,
  width: 'calc(100% - 16px)',
  border: '1px solid #D1E2F4',
  flexDirection: 'column'
}))

const ChartHeader = styled(Grid)(() => ({
  borderBottom: '2px inset #E6F1FD',
  paddingBottom: '10px'
}))

const Chart = ({
  children,
  id,
  title,
  isLoading = false,
  tooltip = undefined,
  warningTooltip = undefined,
  height = 300
}: PropsWithChildren<ChartProps>) => {
  return (
    <ChartContainer id={id} sx={{ height: height }}>
      {title && (
        <ChartHeader container item>
          <Grid container item>
            <Typography variant="h3" color="primary">
              {title}
              {tooltip && (
                <Tooltip title="Les localisations des patients sont affichées uniquement si leur adresse est disponible (certains patients n'ayant pas d'adresse associée).">
                  <IconButton style={{ padding: '0 0 0 4px', marginTop: '-2.5px', position: 'absolute' }}>
                    <InfoIcon style={{ height: 22 }} />
                  </IconButton>
                </Tooltip>
              )}
              {warningTooltip && (
                <Tooltip title="Le nombre de patients de ce périmètre est très large, la carte peut être lente à charger.">
                  <IconButton
                    style={{ padding: '0 0 0 4px', marginTop: '-2.5px', marginLeft: '25px', position: 'absolute' }}
                  >
                    <WarningIcon color="warning" style={{ height: 22 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Typography>
          </Grid>
        </ChartHeader>
      )}
      <Grid container item justifyContent="center" alignItems="center" style={{ flexGrow: 1 }} height="100%">
        {isLoading ? <CircularProgress /> : children}
      </Grid>
    </ChartContainer>
  )
}

export default Chart
