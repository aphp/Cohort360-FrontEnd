import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import clsx from 'clsx'

import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'

import ScopeTree from 'components/ScopeTree/ScopeTree'

import { closeAllOpenedPopulation } from 'state/scope'

import useStyles from './styles'

const Scope = () => {
  const classes = useStyles()
  const history = useHistory()
  const dispatch = useDispatch()

  const [selectedItems, onChangeSelectedItem] = useState([])
  const open = useSelector((state) => state.drawer)

  useEffect(() => {
    dispatch(closeAllOpenedPopulation())
  }, [])

  const trimItems = () => {
    let _selectedItems = selectedItems ? selectedItems : []

    // If you chenge this code, change it too inside: PopulationCard.tsx:31
    _selectedItems = _selectedItems.filter((item, index, array) => {
      // reemove double item
      const foundItem = array.find(({ id }) => item.id === id)
      const currentIndex = foundItem ? array.indexOf(foundItem) : -1
      if (index !== currentIndex) return false

      const parentItem = array.find(({ subItems }) => !!subItems?.find((subItem) => subItem.id === item.id))
      if (parentItem !== undefined) {
        const selectedChildren =
          parentItem.subItems && parentItem.subItems.length > 0
            ? parentItem.subItems.filter((subItem) => !!array.find(({ id }) => id === subItem.id))
            : []

        if (selectedChildren.length === parentItem.subItems.length) {
          // Si item + TOUS LES AUTRES child sont select. => Delete it
          return false
        } else {
          // Sinon => Keep it
          return true
        }
      } else {
        if (
          !item.subItems ||
          (item.subItems && item.subItems.length === 0) ||
          (item.subItems && item.subItems.length > 0 && item.subItems[0].id === 'loading')
        ) {
          // Si pas d'enfant, pas de check => Keep it
          return true
        }

        const selectedChildren =
          item.subItems && item.subItems.length > 0
            ? item.subItems.filter((subItem) => !!array.find(({ id }) => id === subItem.id))
            : []

        if (selectedChildren.length === item.subItems.length) {
          // Si tous les enfants sont check => Keep it
          return true
        } else {
          // Sinon => Delete it
          return false
        }
      }
    })

    const perimetresIds = _selectedItems.map((_selected) =>
      _selected.extension
        ? (_selected.extension.find((extension) => extension.url === 'cohort-id') ?? { valueInteger: 0 }).valueInteger
        : null
    )
    history.push(`/perimetres?${perimetresIds}`)
  }

  return (
    <Grid
      container
      direction="column"
      position="fixed"
      className={clsx(classes.root, classes.appBar, {
        [classes.appBarShift]: open
      })}
    >
      <Grid container justify="center" alignItems="center">
        <Grid container item xs={11} direction="column">
          <Typography variant="h1" color="primary" className={classes.title}>
            Explorer un perimètre
          </Typography>
          <Paper className={classes.paper}>
            <ScopeTree defaultSelectedItems={selectedItems} onChangeSelectedItem={onChangeSelectedItem} />
          </Paper>
        </Grid>
        <Grid container item justify="center" className={classes.bottomBar}>
          <Grid container item justify="flex-end" xs={11} className={classes.buttons}>
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
