import React, { useEffect, useState } from 'react'
import CareSiteExploration from 'components/ScopeTree/CareSiteExploration'
import { Button, Grid } from '@mui/material'
import ScopeSearchBar from 'components/Inputs/ScopeSearchBar/ScopeSearchBar'
import CareSiteSearch from 'components/ScopeTree/CareSiteSearch/index'
import useStyles from './styles'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'state'
import { closeAllOpenedPopulation, ScopeState } from 'state/scope'
import { ScopeTreeRow } from '../../types'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import CareSiteChipsets from '../../components/ScopeTree/CareSiteChipsets/CareSiteChipsets'
import { onSelect } from '../../components/ScopeTree/utils/scopeTreeUtils'
import ScopeTree from '../../components/ScopeTree'

const CareSiteView = () => {
  const { classes, cx } = useStyles()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { scopeState } = useAppSelector<{
    scopeState: ScopeState
  }>((state) => ({
    scopeState: state.scope || {}
  }))
  const { scopesList = [] } = scopeState
  const [selectedItems, setSelectedItems] = useState<ScopeTreeRow[]>([])
  const [searchedRows, setSearchedRows] = useState<ScopeTreeRow[]>([...scopesList])
  const [openPopulation, setOpenPopulations] = useState<number[]>([])
  const [searchInput, setSearchInput] = useState<string>('')
  const open = useAppSelector((state) => state.drawer)

  const handleSetSearchInput = (value: string) => {
    if (!searchInput) {
      setOpenPopulations([])
    }
    setSearchInput(value)
  }

  const onChangeSelectedItems = (newSelectedItems: ScopeTreeRow[]) => {
    setSelectedItems(newSelectedItems)
  }
  const trimItems = () => {
    const _selectedItems = selectedItems ? selectedItems : []

    const perimetresIds = _selectedItems.map((_selected) => _selected.cohort_id ?? null)
    navigate(`/perimeters?${perimetresIds}`)
  }

  useEffect(() => {
    dispatch(closeAllOpenedPopulation())
  }, [])

  return (
    <Grid
      container
      direction="column"
      position="fixed"
      className={cx(classes.appBar, {
        [classes.appBarShift]: open
      })}
      style={{ height: '100%', overflow: 'auto' }}
    >
      <Grid container justifyContent="center" alignItems="center">
        <Grid container item xs={11} direction="column">
          <Typography variant="h1" color="primary" className={classes.title}>
            Explorer un perimètre
          </Typography>
          <ScopeTree
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            openPopulation={openPopulation}
            setOpenPopulations={setOpenPopulations}
            executiveUnitType={undefined}
          />
        </Grid>
        <Grid
          container
          item
          xs={11}
          justifyContent="center"
          className={cx(classes.bottomBar, {
            [classes.bottomBarShift]: open
          })}
        >
          <Grid container item justifyContent="flex-end" className={classes.buttons}>
            <Button
              variant="contained"
              disableElevation
              onClick={() => onChangeSelectedItems([])}
              disabled={!selectedItems.length}
              className={classes.cancelButton}
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              disableElevation
              disabled={!selectedItems.length}
              onClick={trimItems}
              className={classes.validateButton}
            >
              Valider
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default CareSiteView
