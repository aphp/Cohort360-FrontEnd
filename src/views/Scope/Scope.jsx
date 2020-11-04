import React from 'react'
import useStyles from './styles'
import { useHistory } from 'react-router-dom'
import clsx from 'clsx'
import { useSelector } from 'react-redux'

import Grid from '@material-ui/core/Grid'

import ScopeTree from '../../components/ScopeTree/ScopeTree'
import { Typography } from '@material-ui/core'

const Scope = () => {
  const classes = useStyles()
  const history = useHistory()

  const open = useSelector((state) => state.drawer)

  const trimItems = (selectedItems) => {
    const onlyParents = new Set()
    selectedItems.forEach((element) => {
      let found
      for (const e of selectedItems) {
        if (e.id === element.parentId) {
          found = true
        }
      }

      if (!element.parentId || !found) {
        onlyParents.add(element)
      }
    })

    history.push(
      `/perimetres?${[...onlyParents].map((selected) => selected.id)}`
    )
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
          <ScopeTree valid={trimItems} />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Scope
