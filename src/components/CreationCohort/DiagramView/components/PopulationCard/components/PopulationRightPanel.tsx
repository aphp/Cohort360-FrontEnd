import React, { useState } from 'react'
import { ScopeElement } from 'types'
import ScopeTree from 'components/ScopeTree'
import { Grid, Button, Drawer, Typography } from '@mui/material'
import { SourceType } from 'types/scope'
import { Hierarchy } from 'types/hierarchy'

type PopulationRightPanelProps = {
  open: boolean
  title?: string
  mandatory?: boolean
  population: Hierarchy<ScopeElement, string>[]
  selectedPopulation: Hierarchy<ScopeElement, string>[]
  sourceType: SourceType
  onConfirm: (selectedPopulation: Hierarchy<ScopeElement, string>[]) => void
  onClose: () => void
}

const PopulationRightPanel = ({
  open,
  title,
  population,
  selectedPopulation,
  sourceType,
  mandatory = false,
  onConfirm,
  onClose
}: PopulationRightPanelProps) => {
  const [selectedCodes, setSelectedCodes] = useState<Hierarchy<ScopeElement, string>[]>([])

  return (
    <Drawer
      anchor="right"
      open={open}
      PaperProps={{ style: { width: '650px' } }}
      onClose={onClose}
      sx={{ zIndex: 1300, overflowY: 'unset' }}
    >
      <Grid container direction="column" maxWidth="650px" height="100%" flexWrap="nowrap">
        <Grid item container flexDirection="column" height="100%" flexWrap="nowrap" overflow="auto">
          <Grid container justifyContent="center" borderBottom="1px solid grey" width="100%">
            <Typography fontSize="22px" margin="12px 0px">
              {title ?? 'Structure hospitalière'}
            </Typography>
          </Grid>
          <ScopeTree
            baseTree={population}
            selectedNodes={selectedPopulation}
            onSelect={setSelectedCodes}
            sourceType={sourceType}
          />
        </Grid>
        <Grid
          container
          item
          alignItems="center"
          justifyContent="center"
          flexWrap="wrap"
          width="100%"
          padding="12px"
          borderTop="1px solid grey"
        >
          <Grid item xs={4} container justifyContent="space-between">
            <Button onClick={onClose} variant="outlined">
              Annuler
            </Button>
            <Button
              disabled={mandatory ? selectedCodes.length === 0 : false}
              onClick={() => onConfirm(selectedCodes)}
              variant="contained"
            >
              Confirmer
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Drawer>
  )
}

export default PopulationRightPanel
