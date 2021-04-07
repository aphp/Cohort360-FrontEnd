import React, { useState, useEffect } from 'react'

import { CircularProgress, Button, Drawer, Typography } from '@material-ui/core'

import ScopeTree from '../../../../../../ScopeTree/ScopeTree'
import { ScopeTreeRow } from 'types'

import { useAppSelector } from 'state'

import useStyles from './styles'

type PopulationRightPanelProps = {
  open: boolean
  onConfirm: (selectedPopulation: ScopeTreeRow[] | null) => void
  onClose: () => void
  isLoadingSubmit?: boolean
}

const PopulationRightPanel: React.FC<PopulationRightPanelProps> = ({ open, onConfirm, onClose, isLoadingSubmit }) => {
  const classes = useStyles()

  const { selectedPopulation = [] } = useAppSelector((state) => state.cohortCreation.request || {})
  const [_selectedPopulation, onChangeSelectedPopulation] = useState<ScopeTreeRow[]>([])

  useEffect(() => {
    onChangeSelectedPopulation(selectedPopulation ?? [])
  }, [open, selectedPopulation])

  /**
   * Render
   */
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className={classes.root}>
        <div className={classes.drawerTitleContainer}>
          <Typography className={classes.title}>Structure hospitalière</Typography>
        </div>

        <div className={classes.drawerContentContainer}>
          <ScopeTree defaultSelectedItems={_selectedPopulation} onChangeSelectedItem={onChangeSelectedPopulation} />
        </div>

        <div className={classes.drawerActionContainer}>
          <Button onClick={onClose} color="primary" variant="outlined">
            Annuler
          </Button>
          <Button
            disabled={
              isLoadingSubmit || !_selectedPopulation || (_selectedPopulation && _selectedPopulation.length === 0)
            }
            onClick={() => onConfirm(_selectedPopulation)}
            color="primary"
            variant="contained"
          >
            {isLoadingSubmit ? <CircularProgress size={20} /> : 'Confirmer'}
          </Button>
        </div>
      </div>
    </Drawer>
  )
}

export default PopulationRightPanel
