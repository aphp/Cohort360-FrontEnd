import React, { useState, useEffect } from 'react'

import Button from '@material-ui/core/Button'
import Drawer from '@material-ui/core/Drawer'
import Typography from '@material-ui/core/Typography'

import ScopeTree from 'components/ScopeTree/ScopeTree'
import { ScopeTreeRow } from 'types'

import { useAppSelector } from 'state'

import useStyles from './styles'
import ScopeSearchBar from 'components/Inputs/ScopeSearchBar/ScopeSearchBar'

type PopulationRightPanelProps = {
  open: boolean
  onConfirm: (selectedPopulation: ScopeTreeRow[] | null) => void
  onClose: () => void
}

const PopulationRightPanel: React.FC<PopulationRightPanelProps> = (props) => {
  const { open, onConfirm, onClose } = props

  const classes = useStyles()

  const { selectedPopulation = [] } = useAppSelector((state) => state.cohortCreation.request || {})
  const [_selectedPopulation, onChangeSelectedPopulation] = useState<ScopeTreeRow[]>([])
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    onChangeSelectedPopulation(
      selectedPopulation !== null ? (selectedPopulation.filter((elem) => elem !== undefined) as ScopeTreeRow[]) : []
    )
  }, [open]) // eslint-disable-line

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
          <div className={classes.searchBar}>
            <ScopeSearchBar searchInput={searchInput} onChangeInput={setSearchInput} />
          </div>
          <ScopeTree
            searchInput={searchInput}
            defaultSelectedItems={_selectedPopulation}
            onChangeSelectedItem={onChangeSelectedPopulation}
          />
        </div>

        <div className={classes.drawerActionContainer}>
          <Button onClick={onClose} color="primary" variant="outlined">
            Annuler
          </Button>
          <Button
            disabled={!_selectedPopulation || (_selectedPopulation && _selectedPopulation.length === 0)}
            onClick={() => onConfirm(_selectedPopulation)}
            color="primary"
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
