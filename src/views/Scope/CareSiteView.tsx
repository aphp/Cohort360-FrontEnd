import React, { useEffect, useState } from 'react'
import { Button, Grid } from '@mui/material'
import useStyles from './styles'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'state'
import { closeAllOpenedPopulation } from 'state/scope'
import { ScopeTreeRow } from 'types'
import Typography from '@mui/material/Typography'
import ScopeTree from 'components/ScopeTree'

const CareSiteView = () => {
  const { classes, cx } = useStyles()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [selectedItems, setSelectedItems] = useState<ScopeTreeRow[]>([])
  const [openPopulation, setOpenPopulations] = useState<number[]>([])
  const open = useAppSelector((state) => state.drawer)
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
        <Grid container item xs={11}>
          <Typography variant="h1" color="primary" className={classes.title}>
            Explorer un périmètre
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
              onClick={() => setSelectedItems([])}
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
