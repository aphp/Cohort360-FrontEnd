import React, { useState } from 'react'

import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'

import { ScopeTreeRow, ScopeType } from 'types'

import useStyles from './styles'
import ScopeTree from 'components/ScopeTree'

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
    <Drawer anchor="right" open={open} onClose={onClose} className={classes.drawer}>
      <div className={classes.root}>
        <div className={classes.drawerTitleContainer}>
          <Typography className={classes.title}>{title ?? 'Structure hospitalière'}</Typography>
        </div>
        <div className={classes.drawerContentContainer}>
          <ScopeTree
            //selectedIds=""
            selectedIds={'8312016825,8312077037,8312085055,8312016350,8312076084,16180131083'}
            setSelectedItems={_setSelectedPopulation}
            executiveUnitType={executiveUnitType}
            isExecutiveUnit={!!executiveUnitType}
          />
        </div>

        <div className={classes.drawerActionContainer}>
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
        </div>
      </div>
    </Drawer>
  )
}

export default PopulationRightPanel
