import SaveIcon from '@mui/icons-material/Save'
import { Box, Link, Typography } from '@mui/material'
import cohortLogo from 'assets/images/logo-login.png'
import { isAxiosError } from 'axios'
import React from 'react'
import Markdown from 'react-markdown'
import services from 'services/aphp'
import { useAppDispatch, useAppSelector } from 'state'
import { updateMaintenance } from 'state/me'
import useStyles from './styles'

const Maintenance = () => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const maintenance = useAppSelector((state) => state.me?.maintenance)

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

        <Typography className={classes.subtitle}>{maintenance?.subject}</Typography>

        {maintenance?.message && (
          <Markdown
            components={{
              p: ({ children }) => <Typography className={classes.message}>{children}</Typography>,
              a: ({ href, children }) => (
                <Link href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </Link>
              )
            }}
          >
            {maintenance.message}
          </Markdown>
        )}

        {!maintenance?.isDataSavedMessageHidden && (
        <Box className={classes.infoBanner}>
          <SaveIcon sx={{ fontSize: 14 }} />
            <Typography component="p" className={classes.infoBannerText}>
              Les requêtes, cohortes et échantillons déjà enregistrés seront conservées.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default Maintenance
