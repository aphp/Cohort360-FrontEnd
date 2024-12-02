import React, { ReactNode } from 'react'
import useStyles from './styles'
import { Alert, Button, Divider, FormLabel, Grid, IconButton, Switch, TextField, Typography } from '@mui/material'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
import { PropsWithChildren } from 'react'

type CriteriaLayoutProps = {
  isEdition: boolean
  goBack: () => void
  onSubmit: () => void
  disabled: boolean
  criteriaLabel: string
  mainTitle: string
  title: string
  onChangeTitle: (title: string) => void
  isInclusive: boolean
  onChangeIsInclusive: (isInclusive: boolean) => void
  infoAlert?: ReactNode[]
  warningAlert?: ReactNode[]
  errorAlert?: ReactNode[]
}

const CriteriaLayout: React.FC<PropsWithChildren<CriteriaLayoutProps>> = ({
  isEdition,
  goBack,
  onSubmit,
  disabled,
  criteriaLabel,
  children,
  mainTitle,
  title,
  onChangeTitle,
  isInclusive,
  onChangeIsInclusive,
  infoAlert,
  warningAlert,
  errorAlert
}) => {
  const { classes } = useStyles()

  return (
    <Grid className={classes.root}>
      <Grid className={classes.actionContainer}>
        {!isEdition ? (
          <>
            <IconButton className={classes.backButton} onClick={goBack}>
              <KeyboardBackspaceIcon />
            </IconButton>
            <Divider className={classes.divider} orientation="vertical" flexItem />
            <Typography className={classes.titleLabel}>Ajouter un critère {criteriaLabel}</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère {criteriaLabel}</Typography>
        )}
      </Grid>

      <Grid className={classes.formContainer}>
        {infoAlert &&
          infoAlert.length > 0 &&
          infoAlert.map(
            (alert, index) =>
              alert && (
                <Alert key={index} severity="info">
                  {alert}
                </Alert>
              )
          )}
        {warningAlert &&
          warningAlert.length > 0 &&
          warningAlert.map(
            (alert, index) =>
              alert && (
                <Alert key={index} severity="warning">
                  {alert}
                </Alert>
              )
          )}
        {errorAlert &&
          errorAlert.length > 0 &&
          errorAlert.map(
            (alert, index) =>
              alert && (
                <Alert key={index} severity="error">
                  {alert}
                </Alert>
              )
          )}

        <Grid className={classes.inputContainer} container>
          <Typography variant="h6">{mainTitle}</Typography>

          <TextField
            required
            className={classes.inputItem}
            id="criteria-name-required"
            placeholder="Nom du critère"
            variant="outlined"
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
          />

          <Grid style={{ display: 'flex' }}>
            <FormLabel
              onClick={() => onChangeIsInclusive(!isInclusive)}
              style={{ margin: 'auto 1em' }}
              component="legend"
            >
              Exclure les patients qui suivent les règles suivantes
            </FormLabel>
            <Switch
              id="criteria-inclusive"
              checked={!isInclusive}
              onChange={() => onChangeIsInclusive(!isInclusive)}
              color="secondary"
            />
          </Grid>
          {children}
        </Grid>
      </Grid>

      <Grid className={classes.criteriaActionContainer}>
        {!isEdition && (
          <Button onClick={goBack} variant="outlined">
            Annuler
          </Button>
        )}
        <Button onClick={onSubmit} disabled={disabled} type="submit" variant="contained">
          Confirmer
        </Button>
      </Grid>
    </Grid>
  )
}

export default CriteriaLayout
