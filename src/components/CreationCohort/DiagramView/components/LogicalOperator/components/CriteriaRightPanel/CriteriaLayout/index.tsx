import React from 'react'
import useStyles from './styles'
import { Button, Divider, FormLabel, Grid, IconButton, Switch, TextField, Typography } from '@mui/material'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
import { PropsWithChildren } from 'react'

type CriteriaLayoutProps = {
  isEdition: boolean
  goBack: () => void
  onSubmit: () => void
  disabled: boolean
  title: string
  onChangeTitle: (title: string) => void
  isInclusive: boolean
  onChangeIsInclusive: (isInclusive: boolean) => void
}

const CriteriaLayout: React.FC<PropsWithChildren<CriteriaLayoutProps>> = ({
  isEdition,
  goBack,
  onSubmit,
  disabled,
  children,
  title,
  onChangeTitle,
  isInclusive,
  onChangeIsInclusive
}) => {
  const { classes } = useStyles()

  console.log('isInclusive', isInclusive)
  return (
    <Grid className={classes.root}>
      <Grid className={classes.actionContainer}>
        {!isEdition ? (
          <>
            <IconButton className={classes.backButton} onClick={goBack}>
              <KeyboardBackspaceIcon />
            </IconButton>
            <Divider className={classes.divider} orientation="vertical" flexItem />
            <Typography className={classes.titleLabel}>Ajouter un critère {title}</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère {title}</Typography>
        )}
      </Grid>

      <Grid className={classes.formContainer}>
        <Grid className={classes.inputContainer} container>
          <Typography variant="h6">{title}</Typography>

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
        {isEdition && (
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
