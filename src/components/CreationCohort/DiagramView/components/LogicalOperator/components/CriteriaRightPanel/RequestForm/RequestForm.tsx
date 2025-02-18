import React, { useState } from 'react'

import { Alert, Button, Divider, FormLabel, Grid, IconButton, Typography } from '@mui/material'

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import RequestList from 'components/CreationCohort/Modals/ModalCreateNewRequest/components/RequestList'

import { useAppSelector, useAppDispatch } from 'state'
import { addRequestToCohortCreation } from 'state/cohortCreation'

import useStyles from './styles'
import { CriteriaDrawerComponentProps } from 'types'

const RequestForm: React.FC<CriteriaDrawerComponentProps> = ({ parentId, goBack }) => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()

  const projectsList = useAppSelector((state) => state.project.projectsList || [])
  const requestsList = useAppSelector((state) => state.request.requestsList || [])

  const [selectedRequestId, setSelectedRequest] = useState<string | null>(null)
  const [error, setError] = useState(false)

  const _onSubmit = () => {
    if (!selectedRequestId) {
      // If no input has been set
      return setError(true)
    }

    dispatch(addRequestToCohortCreation({ parentId: parentId ?? null, selectedRequestId }))
  }

  return (
    <Grid className={classes.root}>
      <Grid className={classes.actionContainer}>
        <IconButton className={classes.backButton} onClick={goBack}>
          <KeyboardBackspaceIcon />
        </IconButton>
        <Divider className={classes.divider} orientation="vertical" flexItem />
        <Typography className={classes.titleLabel}>Ajouter une requête</Typography>
      </Grid>

      <Grid className={classes.formContainer}>
        {error && <Alert severity="error">Merci de sélectionner une requête</Alert>}

        <Grid className={classes.inputContainer} container>
          <Typography variant="h6">Mes requêtes</Typography>

          <FormLabel style={{ padding: '1em' }} component="legend">
            Veuillez sélectionner la requête que vous voulez intégrer à votre requête actuelle :
          </FormLabel>

          <RequestList
            projectList={projectsList}
            requestsList={requestsList}
            selectedItem={selectedRequestId}
            onSelectedItem={(newOpenRequest: string) =>
              setSelectedRequest(newOpenRequest === selectedRequestId ? null : newOpenRequest)
            }
          />
        </Grid>

        <Grid className={classes.criteriaActionContainer}>
          <Button onClick={goBack} variant="outlined">
            Annuler
          </Button>

          <Button onClick={_onSubmit} type="submit" form="demographic-form" variant="contained">
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default RequestForm
