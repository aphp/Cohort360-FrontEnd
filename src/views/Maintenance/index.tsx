import { Grid, Link, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import cohortLogo from 'assets/images/logo-login.png'
import services from 'services/aphp'
import { isAxiosError } from 'axios'
import { useAppDispatch, useAppSelector } from 'state'
import { updateMaintenance } from 'state/me'
import { useStyles } from 'views/PageNotFound/styles'

const Maintenance = () => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const maintenance = useAppSelector((state) => state.me?.maintenance)

  useEffect(() => {
    ;(async () => {
      const maintenanceResponse = await services.practitioner.maintenance()

      if (maintenanceResponse.status !== 200 || isAxiosError(maintenanceResponse)) {
        console.error('Error while fetching maintenance status')
        return
      }

      dispatch(updateMaintenance(maintenanceResponse.data))
    })()
  }, [dispatch])

  return (
    <>
      <Link className={classes.logo}>
        <img src={cohortLogo} alt="Cohort360 logo" style={{ height: 50 }} />
      </Link>
      <Grid container className={classes.megaContainer} sx={{ flexDirection: 'column', alignItems: 'center' }}>
        <Grid container size={5} sx={{ flexDirection: 'column', alignItems: 'center' }} style={{ marginTop: '16em' }}>
          <Typography variant="h1" className={classes.oups}>
            Application non disponible
          </Typography>
          {maintenance?.message && (
            <Typography color="primary" variant="h2" style={{ margin: '12px 0' }}>
              {maintenance.message}
            </Typography>
          )}
          <Typography color="primary" variant="h2" style={{ margin: '12px 0' }}>
            Nous vous informerons dès que Cohort360 sera de nouveau accessible. Merci pour votre compréhension.
          </Typography>
        </Grid>
      </Grid>
    </>
  )
}

export default Maintenance
