import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Box, Checkbox, Divider, FormControlLabel, Typography } from '@mui/material'
import React from 'react'

import { COMMITMENTS } from '../../commitments'
import { useOnboarding } from '../../OnboardingContext'
import useStyles from '../../styles'

export const CHARTER_CONSENT_TEXT =
  'Je certifie avoir pris connaissance de mes responsabilités vis-à-vis de l’utilisation des données mises à disposition dans Cohort360 et je m’engage à les respecter.'

const CommitmentsSummary = () => {
  const { classes } = useStyles()
  const { acknowledged, setAcknowledged } = useOnboarding()

  return (
    <Box>
      <Typography variant="h4" className={classes.title}>
        Synthèse de vos engagements
      </Typography>
      <Box className={classes.commitmentList}>
        {COMMITMENTS.map((commitment) => (
          <Box key={commitment} className={classes.commitmentRow}>
            <CheckCircleIcon className={classes.checkIcon} fontSize="small" />
            <Typography className={classes.commitmentLabel}>{commitment}</Typography>
          </Box>
        ))}
      </Box>
      <Divider className={classes.divider} />
      <FormControlLabel
        className={classes.consentRow}
        control={
          <Checkbox
            className={classes.consentCheckbox}
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
          />
        }
        label={<Typography className={classes.consentText}>{CHARTER_CONSENT_TEXT}</Typography>}
      />
    </Box>
  )
}

export default CommitmentsSummary
