import React, { useEffect, useState } from 'react'
import { Button, Grid } from '@mui/material'
import useStyles from './styles'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'state'
import { closeAllOpenedPopulation } from 'state/scope'
import { ScopeElement } from 'types'
import Typography from '@mui/material/Typography'
import ScopeTree from 'components/ScopeTree'
import { Hierarchy } from 'types/hierarchy'
import { SourceType } from 'types/scope'

const CareSiteView = () => {
  const { classes, cx } = useStyles()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const population = useAppSelector((state) => state.scope.rights)
  const [selectedCodes, setSelectedCodes] = useState<Hierarchy<ScopeElement, string>[]>([])
  const open = useAppSelector((state) => state.drawer)

  const handleNavigation = () => {
    const perimetresIds = selectedCodes.map((code) => code.cohort_id ?? null).filter(Boolean)
    const searchParams = new URLSearchParams({ groupId: perimetresIds.join(',') }).toString()
    navigate(`/perimeters?${searchParams}`)
  }

  useEffect(() => {
    dispatch(closeAllOpenedPopulation())
  }, [])

  return (
    <Grid
      container
      direction="column"
      className={cx(classes.appBar, {
        [classes.appBarShift]: open
      })}
      style={{ height: '100%' }}
    >
      <Grid container justifyContent="center" alignItems="center">
        <Grid container item xs={11} direction="column">
          <Typography variant="h1" color="primary" className={classes.title}>
            Explorer un périmètre
          </Typography>
          <ScopeTree
            selectedNodes={[]}
            baseTree={population}
            onSelect={(items) => setSelectedCodes(items)}
            sourceType={SourceType.ALL}
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
              disabled={!selectedCodes.length}
              onClick={handleNavigation}
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
