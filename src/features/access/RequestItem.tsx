import React, { useState } from 'react'
import clsx from 'clsx'
import moment from 'moment'

import { IPractitionerRole } from '@ahryman40k/ts-fhir-types/lib/R4'
import { Grid, makeStyles, MenuItem, Select, Typography } from '@material-ui/core'

import { PERMISSION_STATUS_STRUCTURE_DEF_URL } from '../../constants'
import { updateAccessRequest } from './AccessRequestSlice'
import CohortButton from 'common/CohortButton'
import RequestInfos from './RequestInfos'
import { AccessRequest } from './RequestSelector'
import { useAppDispatch } from 'state'

const useStyles = makeStyles((theme) => ({
  rootContainer: {
    padding: theme.spacing(2)
  },
  textBlack: {
    color: '#000'
  },
  buttonsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: theme.spacing(1)
  },
  denyButton: {
    backgroundColor: '#7f0000',
    '&:hover': {
      backgroundColor: '#a54242'
    }
  },
  control: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    paddingBlock: theme.spacing(1)
  },
  controlLabel: {
    marginRight: theme.spacing(2)
  }
}))

type RequestItemProps = {
  request: AccessRequest
}

const RequestItem = ({ request }: RequestItemProps) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const [nominativeAccess, setNominativeAccess] = useState<'yes' | 'no'>('yes')
  const [accessDelay, setAccessDelay] = useState<'week' | 'month' | 'year'>('week')

  const handleChangeNominativeAccess = (event: React.ChangeEvent<{ value: unknown }>) => {
    setNominativeAccess(event.target.value as 'yes' | 'no')
  }
  const handleChangeAccessDelay = (event: React.ChangeEvent<{ value: unknown }>) => {
    setAccessDelay(event.target.value as 'week' | 'month' | 'year')
  }
  const handleSubmitAccess = (isRejected?: boolean) => () => {
    const startDate = new Date()
    const endDate = moment(startDate).add(1, accessDelay).toDate()
    const practitionerRole: IPractitionerRole = {
      resourceType: 'PractitionerRole',
      id: request.id,
      extension: [
        {
          url: PERMISSION_STATUS_STRUCTURE_DEF_URL,
          valueCode: isRejected ? `rejected` : 'active'
        }
      ],
      period: isRejected
        ? undefined
        : {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          }
    }
    dispatch(updateAccessRequest(practitionerRole))
  }

  return (
    <Grid container className={classes.rootContainer} justify="space-between" spacing={2}>
      <Grid item xs={12} md={7}>
        <RequestInfos request={request} />
      </Grid>
      <Grid item xs={12} md={4}>
        <div className={classes.buttonsContainer}>
          <CohortButton onClick={handleSubmitAccess()}>Donner l'accès</CohortButton>
          <CohortButton onClick={handleSubmitAccess(true)} className={classes.denyButton}>
            Refuser
          </CohortButton>
        </div>
        <div className={classes.control}>
          <Typography variant="subtitle1" className={clsx(classes.textBlack, classes.controlLabel)}>
            Accès nominatif
          </Typography>
          <Select variant="outlined" onChange={handleChangeNominativeAccess} value={nominativeAccess}>
            <MenuItem value={'yes'}>Oui</MenuItem>
            <MenuItem value={'no'}>Non</MenuItem>
          </Select>
        </div>
        <div className={classes.control}>
          <Typography variant="subtitle1" className={clsx(classes.textBlack, classes.controlLabel)}>
            Durée des accès
          </Typography>
          <Select variant="outlined" onChange={handleChangeAccessDelay} value={accessDelay}>
            <MenuItem value={'week'}>1 semaine</MenuItem>
            <MenuItem value={'month'}>1 mois</MenuItem>
            <MenuItem value={'year'}>1 an</MenuItem>
          </Select>
        </div>
      </Grid>
    </Grid>
  )
}

export default RequestItem
