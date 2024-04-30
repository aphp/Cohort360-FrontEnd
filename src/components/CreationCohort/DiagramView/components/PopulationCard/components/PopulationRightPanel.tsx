import React, { useState } from 'react'

import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'

import { ScopeTreeRow, ScopeType } from 'types'

import useStyles from './styles'
import ScopeTree from 'components/ScopeTree'
import { Grid } from '@mui/material'

type PopulationRightPanelProps = {
  open: boolean
  title?: string
  executiveUnitType?: ScopeType
  selectedPopulation: ScopeTreeRow[]
  isAcceptEmptySelection?: boolean
  onConfirm: (selectedPopulation: ScopeTreeRow[]) => void
  onClose: () => void
}

const PopulationRightPanel: React.FC<PopulationRightPanelProps> = (props) => {
  const { open, title, executiveUnitType, selectedPopulation, isAcceptEmptySelection, onConfirm, onClose } = props

  const { classes } = useStyles()

  const [_selectedPopulation, _setSelectedPopulation] = useState<ScopeTreeRow[]>(selectedPopulation)

  /**
   * Render
   */
  return (
    <Drawer
      anchor="right"
      open={open}
      PaperProps={{ style: { overflowY: 'unset', width: '650px' } }}
      onClose={onClose}
      className={classes.drawer}
    >
      <Grid container direction="column" flexWrap="nowrap" className={classes.root}>
        <Grid item container flexDirection="column" height="100%" flexWrap="nowrap" overflow="auto">
          <Grid item className={classes.drawerTitleContainer} width="100%">
            <Typography className={classes.title}>{title ?? 'Structure hospitalière'}</Typography>
          </Grid>
          <ScopeTree
            //selectedIds=""
            selectedIds={'8312016825,8312077037,8312085055,8312016350,8312076084,16180131083,18042109754'}
            //selectedIds={'8312016825,8312077037,8312085055,8312016350,8312076084,16180131083'}
            //selectedIds={'16180131083'}
            setSelectedItems={_setSelectedPopulation}
            executiveUnitType={executiveUnitType}
            isExecutiveUnit={!!executiveUnitType}
          />
        </Grid>
        <Grid item className={classes.drawerActionContainer} width="100%">
          <Button onClick={onClose} variant="outlined">
            Annuler
          </Button>
          <Button
            disabled={
              !isAcceptEmptySelection &&
              (!_selectedPopulation || (_selectedPopulation && _selectedPopulation.length === 0))
            }
            onClick={() => onConfirm(_selectedPopulation)}
            variant="contained"
          >
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Drawer>
  )
}

export default PopulationRightPanel
