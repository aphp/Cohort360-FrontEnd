import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import clsx from 'clsx'

import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'

import ScopeTree from '../../components/ScopeTree/ScopeTree'

import useStyles from './styles'

const Scope = () => {
  const classes = useStyles()
  const history = useHistory()

  const [selectedItems, onChangeSelectedItem] = useState([])
  const open = useSelector((state) => state.drawer)

  const trimItems = () => {
    let onlyParents = []
    const _selectedItems = selectedItems ? selectedItems : []

    for (const element of _selectedItems) {
      if (onlyParents.find((onlyParent) => onlyParent?.subItems?.find(({ id }) => id === element.id))) continue

      if (element && element.subItems && element.subItems.length > 0 && element.subItems[0].id !== 'loading') {
        const filteredItems = element.subItems.filter((subItem) =>
          _selectedItems.some(({ id }) => subItem && subItem.id === id)
        )

        if (element.subItems.length === filteredItems?.length) {
          onlyParents = [...onlyParents, element]
        } else {
          onlyParents = [...onlyParents, ...filteredItems]
        }
      } else {
        onlyParents = [...onlyParents, element]
      }
    }

    onlyParents = onlyParents.filter(
      (onlyParent, index) => onlyParents.indexOf(onlyParent) === index && onlyParent?.id !== 'loading'
    )

    history.push(`/perimetres?${onlyParents.map((selected) => selected.id)}`)
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
        <Grid container item xs={12} sm={9} direction="column">
          <Typography variant="h1" color="primary" className={classes.title}>
            Explorer un perimètre
          </Typography>
          <Paper className={classes.paper}>
            <ScopeTree defaultSelectedItems={selectedItems} onChangeSelectedItem={onChangeSelectedItem} />

            <div className={classes.buttons}>
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
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Scope
