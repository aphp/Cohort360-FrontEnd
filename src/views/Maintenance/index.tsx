import SaveIcon from '@mui/icons-material/Save'
import { Box, Link, Typography } from '@mui/material'
import cohortLogo from 'assets/images/logo-login.png'
import { isAxiosError } from 'axios'
import React from 'react'
import services from 'services/aphp'
import { useAppDispatch, useAppSelector } from 'state'
import { updateMaintenance } from 'state/me'
import useStyles from './styles'

const Maintenance = () => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const maintenance = useAppSelector((state) => state.me?.maintenance)

  const formatMaintenanceDate = (value?: string) => {
    if (!value) {
      return null
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return null
    }

    return date.toLocaleString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const startLabel = formatMaintenanceDate(maintenance?.maintenance_start)
  const endLabel = formatMaintenanceDate(maintenance?.maintenance_end)

  React.useEffect(() => {
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
    <Box className={classes.page}>
      <Box className={classes.header}>
        <Link className={classes.logo} aria-label="Cohort360">
          <img src={cohortLogo} alt="Cohort360 logo" style={{ height: 50 }} />
        </Link>
      </Box>
      <Box className={classes.contentWrapper}>
        <Typography className={classes.title}>Cohort360 est temporairement indisponible</Typography>

        <Typography className={classes.subtitle}>Nous rencontrons actuellement un incident technique</Typography>

        <Typography className={classes.bodyText}>
          Nous publierons ici chaque nouvelle information importante :
        </Typography>

        <Box component="ul" className={classes.list}>
          {startLabel && <li>Début de l&apos;interruption : {startLabel}</li>}
          {endLabel && <li>Prochaine mise à jour : {endLabel}</li>}
        </Box>

        <Typography className={classes.bodyText}>En cas de besoins, contactez le support :</Typography>
        <Link className={classes.supportLink} href="mailto:id.recherche.support.dsn@aphp.fr">
          id.recherche.support.dsn@aphp.fr
        </Link>

        <Box className={classes.infoBanner}>
          <SaveIcon sx={{ fontSize: 14 }} />
          <Typography component="p" className={classes.infoBannerText}>
            Les requêtes, cohortes et échantillons déjà enregistrées seront conservées.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default Maintenance
