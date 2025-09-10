import React, { useState } from 'react'

import { Chip, CircularProgress, Grid, IconButton, Typography } from '@mui/material'

import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { Hierarchy } from 'types/hierarchy'
import { ScopeElement } from 'types/scope'
import { Rights } from 'types/scope'
import { v4 as uuidv4 } from 'uuid'

export type PopulationCardPropsType = {
  label?: string
  loading: boolean
  onEditDisabled: boolean
  population: Hierarchy<ScopeElement>[]
  onEdit: () => void
}

const PopulationCard = ({ label, onEditDisabled, population, loading, onEdit }: PopulationCardPropsType) => {
  const [isExtended, setIsExtended] = useState(false)

  if (loading)
    return (
      <div>
        <CircularProgress />
      </div>
    )

  return (
    <Grid
      container
      alignItems="center"
      sx={{ background: 'white' }}
      borderRadius="4px"
      padding="8px 16px"
      border="3px solid #D3DEE8"
      flex={1}
    >
      <Grid
        container
        size={11}
        sx={{ alignItems: 'center', justifyContent: 'flex-start', gap: '8px', flexWrap: 'wrap' }}
      >
        <Grid>
          <Typography padding="0 1em" variant="h6" align="left">
            {label ?? 'Population source :'}
          </Typography>
        </Grid>
        <Grid>
          {population
            .slice(0, isExtended ? population.length : 4)
            .map((pop) =>
              pop.id !== Rights.EXPIRED ? (
                <Chip
                  sx={{ margin: '4px', fontSize: 11, fontWeight: 'bold' }}
                  key={`${uuidv4()}-${pop.name}`}
                  label={pop.name}
                />
              ) : (
                <Chip sx={{ margin: '4px', fontSize: 11, fontWeight: 'bold' }} key={uuidv4()} label={'?'} />
              )
            )}
          {!isExtended && population.length > 4 && (
            <IconButton size="small" onClick={() => setIsExtended(true)}>
              <MoreHorizIcon />
            </IconButton>
          )}
          {isExtended && population.length > 4 && (
            <IconButton size="small" onClick={() => setIsExtended(false)}>
              <CloseIcon />
            </IconButton>
          )}
        </Grid>
      </Grid>
      <Grid container size={1} sx={{ alignSelf: 'center' }}>
        <IconButton color="primary" size="small" onClick={onEdit} disabled={onEditDisabled}>
          <EditIcon />
        </IconButton>
      </Grid>
    </Grid>
  )
}

export default PopulationCard
