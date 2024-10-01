import React, { useEffect, useState } from 'react'
import { Button, Grid, Typography } from '@mui/material'
import useStyles from './styles'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'state'
import { closeAllOpenedPopulation } from 'state/scope'
import ScopeTree from 'components/ScopeTree'
import { Hierarchy } from 'types/hierarchy'
import { ScopeElement, SourceType } from 'types/scope'

const CareSiteView = () => {
  const { classes, cx } = useStyles()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const population = useAppSelector((state) => state.scope.rights)
  const [selectedCodes, setSelectedCodes] = useState<Hierarchy<ScopeElement>[]>([])
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
      className={cx(classes.appBar, {
        [classes.appBarShift]: open
      })}
      justifyContent={'center'}
    >
      <Grid container xs={11} alignItems="center" height={'calc(100vh - 175px)'}>
        <Typography variant="h1" color="primary" className={classes.title}>
          Explorer un périmètre
        </Typography>
        <ScopeTree
          selectedNodes={[]}
          baseTree={population}
          onSelect={(items) => setSelectedCodes(items)}
          sourceType={SourceType.ALL}
          sx={{ backgroundColor: '#E6F1FD' }}
        />
        <Grid
          container
          justifyContent="center"
          style={{ position: 'fixed', bottom: 0, right: 0, backgroundColor: '#E6F1FD' }}
        >
          <Grid container justifyContent={'flex-end'} xs={11}>
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
