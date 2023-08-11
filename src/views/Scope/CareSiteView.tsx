import React, { useEffect, useState } from 'react'
import CareSiteExploration from 'components/NewScopeTree/ExploratedCareSite/CareSiteExploration'
import { Button, Grid } from '@mui/material'
import ScopeSearchBar from 'components/Inputs/ScopeSearchBar/ScopeSearchBar'
import CareSiteSearch from 'components/NewScopeTree/CareSiteSearch/CareSiteSearch'
import useStyles from './styles'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../state'
import { closeAllOpenedPopulation } from '../../state/scope'
import { ScopeTreeRow } from '../../types'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'

const CareSiteView = () => {
  const { classes, cx } = useStyles()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [selectedItems, setSelectedItems] = useState<ScopeTreeRow[]>([])
  const [openPopulation, setOpenPopulations] = useState<number[]>([])
  const [searchInput, setSearchInput] = useState<string>('')
  const open = useAppSelector((state) => state.drawer)
  // const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false)

  useEffect(() => {
    dispatch(closeAllOpenedPopulation())
  }, [])

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
          <Grid container direction="row">
            <ScopeSearchBar searchInput={searchInput} setSearchInput={handleSetSearchInput} />
          </Grid>
          <Paper className={classes.paper}>
            {searchInput ? (
              <CareSiteSearch
                searchInput={searchInput}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
              />
            ) : (
              <CareSiteExploration
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                openPopulation={openPopulation}
                setOpenPopulations={setOpenPopulations}
              />
            )}
          </Paper>
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
