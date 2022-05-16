import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import clsx from 'clsx'

import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'

import ScopeTree from 'components/ScopeTree/ScopeTree'

import { useAppSelector, useAppDispatch } from 'state'
import { closeAllOpenedPopulation } from 'state/scope'
import { filterScopeTree } from 'utils/scopeTree'

import useStyles from './styles'

const Scope = () => {
  const classes = useStyles()
  const history = useHistory()
  const dispatch = useAppDispatch()

  const [selectedItems, onChangeSelectedItem] = useState([])
  const open = useAppSelector((state) => state.drawer)

  useEffect(() => {
    dispatch(closeAllOpenedPopulation())
  }, [])

  const trimItems = () => {
    let _selectedItems = selectedItems ? selectedItems : []

    _selectedItems = filterScopeTree(_selectedItems)

    const perimetresIds = _selectedItems.map((_selected) =>
      _selected.extension
        ? (_selected.extension.find((extension) => extension.url === 'cohort-id') ?? { valueInteger: 0 }).valueInteger
        : null
    )
    history.push(`/perimeters?${perimetresIds}`)
  }

  return (
    <Grid
      container
      direction="column"
      position="fixed"
      className={clsx(classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      <Grid container justifyContent="center" alignItems="center">
        <Grid container item xs={11} direction="column">
          <Typography variant="h1" color="primary" className={classes.title}>
            Explorer un perimètre
          </Typography>
          <Paper className={classes.paper}>
            <ScopeTree defaultSelectedItems={selectedItems} onChangeSelectedItem={onChangeSelectedItem} />
          </Paper>
        </Grid>
        <Grid container item justifyContent="center" className={classes.bottomBar}>
          <Grid container item justifyContent="flex-end" xs={11} className={classes.buttons}>
            <Button
              variant="contained"
              disableElevation
              onClick={() => onChangeSelectedItem([])}
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

export default Scope
