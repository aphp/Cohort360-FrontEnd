import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import ScopeTree from 'components/ScopeTree/ScopeTree'
import Searchbar from 'components/ui/Searchbar/Searchbar'
import SearchInput from 'components/ui/Searchbar/SearchInput'

import { useAppDispatch, useAppSelector } from 'state'
import { closeAllOpenedPopulation } from 'state/scope'

import useStyles from './styles'

const Scope = () => {
  const { classes, cx } = useStyles()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [selectedItems, setSelectedItem] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const open = useAppSelector((state) => state.drawer)

  useEffect(() => {
    dispatch(closeAllOpenedPopulation())
  }, [])

  const onChangeSelectedItem = (newSelectedItems) => {
    setSelectedItem(newSelectedItems)
  }
  const trimItems = () => {
    let _selectedItems = selectedItems ? selectedItems : []

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
        <Grid container item xs={11}>
          <Typography variant="h1" color="primary" className={classes.title}>
            Explorer un perimètre
          </Typography>
          <Grid item xs={12}>
            <Searchbar>
              <Grid container justifyContent="flex-end">
                <Grid item xs={6} margin="20px 0px">
                  <SearchInput
                    value={searchInput}
                    placeholder="Rechercher"
                    onchange={(newValue) => setSearchInput(newValue)}
                  />
                </Grid>
              </Grid>
            </Searchbar>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <ScopeTree
                searchInput={searchInput}
                defaultSelectedItems={selectedItems}
                onChangeSelectedItem={onChangeSelectedItem}
              />
            </Paper>
          </Grid>
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
