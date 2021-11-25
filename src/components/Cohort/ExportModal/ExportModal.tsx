import React, { useState, useEffect, useRef } from 'react'

import Alert from '@material-ui/lab/Alert'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'

import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import CancelIcon from '@material-ui/icons/Cancel'

import InfoIcon from '@material-ui/icons/Info'

import useStyles from './styles'

import export_table from './export_table'
import services from 'services'

const initialState = {
  motif: '',
  conditions: false,
  tables: []
}
const ERROR_MOTIF: 'ERROR_MOTIF' = 'ERROR_MOTIF'
const ERROR_CONDITION: 'ERROR_CONDITION' = 'ERROR_CONDITION'
const ERROR_TABLE: 'ERROR_TABLE' = 'ERROR_TABLE'

type ExportModalProps = {
  cohortId: number
  open: boolean
  handleClose: () => void
}

const ExportModal: React.FC<ExportModalProps> = ({ cohortId, open, handleClose }) => {
  const classes = useStyles()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState(initialState)
  const [exportResponse, setExportResponse] = useState<{ status: 'error' | 'finish'; detail: any } | null>(null)
  const [error, setError] = useState<typeof ERROR_MOTIF | typeof ERROR_CONDITION | typeof ERROR_TABLE | null>(null)

  const dialogRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    setSettings(initialState)
    setExportResponse(null)
    setLoading(false)
    setError(null)
  }, [open])

  const handleChangeTables = (tableId: string) => {
    let existingTableIds: string[] = settings.tables
    const foundItem = existingTableIds.find((existingTableId) => existingTableId === tableId)
    if (foundItem) {
      const index = existingTableIds.indexOf(foundItem)
      existingTableIds.splice(index, 1)
    } else {
      // Attention règle particulière
      if (tableId === 'fact_relationship') {
        const careSiteItem = existingTableIds.find((existingTableId) => existingTableId === 'care_site')
        if (!careSiteItem) {
          existingTableIds = [...existingTableIds, 'care_site']
        }
      }
      if (tableId === 'concept_relationship') {
        const careSiteItem = existingTableIds.find((existingTableId) => existingTableId === 'concept')
        if (!careSiteItem) {
          existingTableIds = [...existingTableIds, 'concept']
        }
      }

      existingTableIds = [...existingTableIds, tableId]
    }
    handleChangeSettings('tables', existingTableIds)
  }

  const handleChangeSettings = (key: 'motif' | 'conditions' | 'tables', value: any) => {
    setError(null)
    setSettings((prevState) => ({
      ...prevState,
      [key]: value
    }))
  }

  const handleSubmit = async () => {
    if (loading) return
    setLoading(true)
    if (typeof services.cohorts.createExport !== 'function') {
      return setLoading(false)
    }

    settings.motif = settings?.motif ? settings?.motif.trim() : ''

    const _scrollUp = () => {
      if (dialogRef !== null) {
        dialogRef?.current?.scrollTo({
          behavior: 'smooth',
          top: 0
        })
      }
    }

    if (!settings?.motif || settings?.motif.length < 10) {
      _scrollUp()
      setLoading(false)
      return setError(ERROR_MOTIF)
    } else if (!settings?.conditions) {
      _scrollUp()
      setLoading(false)
      return setError(ERROR_CONDITION)
    } else if (!settings?.tables || (settings?.tables && settings?.tables.length == 0)) {
      _scrollUp()
      setLoading(false)
      return setError(ERROR_TABLE)
    }

    const response = await services.cohorts.createExport({
      cohortId,
      motivation: settings?.motif,
      tables: settings?.tables
    })

    if (response && response.error) {
      setExportResponse({ status: 'error', detail: response.error.detail })
    } else {
      setExportResponse({ status: 'finish', detail: '' })
    }
    setLoading(false)
  }

  return (
    <Dialog open={loading || open} onClose={handleClose} aria-labelledby="form-dialog-title-export">
      <DialogTitle id="form-dialog-export-title" disableTypography>
        <Typography>Demande d'export</Typography>
      </DialogTitle>

      {exportResponse !== null ? (
        <DialogContent ref={dialogRef}>
          {exportResponse.status === 'finish' ? (
            <Grid container alignItems="center" justify="space-between">
              <CheckCircleOutlineIcon style={{ fontSize: 52 }} htmlColor="#BDEA88" />
              <DialogContentText style={{ marginBottom: 0, width: 'calc(100% - 62px)' }}>
                Votre demande d'export a bien été prise en compte. Vous recevrez un email de confirmation prochainement.
              </DialogContentText>
            </Grid>
          ) : (
            <Grid container alignItems="center" justify="space-between">
              <CancelIcon style={{ fontSize: 52 }} htmlColor="#FC5656" />
              <DialogContentText style={{ marginBottom: 0, width: 'calc(100% - 62px)' }}>
                Une erreur est survenue lors de votre demande d'export. Veuillez{' '}
                <a href="mailto:dsi-id-recherche-support-cohort360@aphp.fr">contacter le support</a> pour plus
                d'informations
                {exportResponse.detail && (
                  <Accordion id="reason-accordion" square className={classes.accordion}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="reason-accordion"
                      id="reason-accordion-summary"
                    >
                      <Typography className={classes.heading}>Motif :</Typography>
                    </AccordionSummary>
                    <AccordionDetails id="reason-accordion-details">
                      <Typography>{exportResponse.detail}</Typography>
                    </AccordionDetails>
                  </Accordion>
                )}
              </DialogContentText>
            </Grid>
          )}
        </DialogContent>
      ) : (
        <DialogContent ref={dialogRef}>
          <DialogContentText>
            Pour effectuer un export de données, veuillez renseigner un motif, selectionner uniquement les tables que
            vous voulez exporter et accepter les conditions de l'entrepôt de données de santé (EDS). <br />
            Tous les champs sont obligatoires
          </DialogContentText>

          <Grid style={{ marginBottom: 12 }}>
            {error === ERROR_MOTIF && (
              <Alert severity="error">
                Merci d'indiquer le motif de votre demande d'export, ce motif doit contenir au moins 10 caractères
              </Alert>
            )}

            {error === ERROR_CONDITION && (
              <Alert severity="error">Merci d'accepter toutes les conditions de l'Entrepôts de données de santé</Alert>
            )}
            {error === ERROR_TABLE && (
              <Alert severity="error">Merci d'indiquer les tables que vous voulez exporter</Alert>
            )}
          </Grid>

          <FormGroup>
            <TextField
              id="motif"
              multiline
              autoFocus
              fullWidth
              rows={3}
              rowsMax={5}
              value={settings.motif}
              helperText="Le motif doit comporter au moins 10 caractères"
              variant="outlined"
              label="Motif de l'export"
              onChange={(e) => handleChangeSettings('motif', e.target.value)}
            />

            <Grid container justify="space-between" alignItems="center">
              <Typography className={classes.tableTitle} variant="h6">
                Tables exportées
              </Typography>

              <IconButton size="small" onClick={() => window.open(`https://doc.eds.aphp.fr/omop/tables`, '_blank')}>
                <InfoIcon />
              </IconButton>
            </Grid>

            <List className={classes.list}>
              {export_table.map(({ table_name, table_id, table_subtitle }) => (
                <ListItem className={classes.tableListElement} key={table_id}>
                  <ListItemText
                    disableTypography
                    primary={
                      <Grid container direction="row" alignItems="center">
                        <Typography variant="body1">{table_name} - </Typography>
                        <Typography variant="body1" style={{ fontStyle: 'italic', paddingLeft: 4 }}>
                          {table_id}
                        </Typography>
                      </Grid>
                    }
                    secondary={
                      table_subtitle && (
                        <Grid container direction="row" alignItems="center">
                          <Typography variant="body2" style={{ color: '#fc1847' }}>
                            {table_subtitle}
                          </Typography>
                        </Grid>
                      )
                    }
                  />

                  <ListItemSecondaryAction>
                    <Checkbox
                      checked={!!settings.tables.find((tableId) => tableId === table_id)}
                      onChange={() => handleChangeTables(table_id)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            <Typography className={classes.tableTitle} variant="h6">
              Conditions de l'EDS
            </Typography>

            <Typography variant="caption">
              Le niveau d’habilitation dont vous disposez dans Cohort360 vous autorise à exporter des données à
              caractère personnel conformément à la réglementation et aux règles institutionnelles d’utilisation des
              données du Système d’Information clinique de l’AP-HP. Vous êtes garant des données exportées et vous vous
              engagez à :
            </Typography>

            <Typography variant="caption" className={classes.conditionItem}>
              N’exporter, parmi les catégories de données accessibles, que les données strictement nécessaires et
              pertinentes au regard des objectifs de la recherche
            </Typography>

            <Typography variant="caption" className={classes.conditionItem}>
              A stocker temporairement les données extraites sur un répertoire dont l’accès est techniquement restreint
              aux personnes dûment habilitées et authentifiées, présentes dans les locaux du responsable de la
              recherche.
            </Typography>

            <Typography variant="caption" className={classes.conditionItem}>
              A ne pas utiliser du matériel ou des supports de stockage n’appartenant pas à l’AP-HP, à ne pas sortir les
              données des locaux de l’AP-HP ou sur un support amovible emporté hors AP-HP.
            </Typography>
            <Typography variant="caption" className={classes.conditionItem}>
              A procéder à la destruction de toutes données exportées, dès qu’il n’y a plus nécessité d’en disposer dans
              le cadre de la recherche dans le périmètre concerné.
            </Typography>

            <Typography variant="caption" className={classes.conditionItem}>
              A ne pas communiquer les données à des tiers non autorisés
            </Typography>

            <Typography variant="caption" className={classes.conditionItem}>
              A informer les chefs de services des UF de Responsabilité où ont été collectées les données exportées
            </Typography>

            <Typography variant="caption" className={classes.conditionItem}>
              A ne pas croiser les données avec tout autre jeu de données, sans autorisation auprès de la CNIL
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  name="conditions"
                  checked={settings.conditions}
                  onChange={() => handleChangeSettings('conditions', !settings.conditions)}
                />
              }
              labelPlacement="end"
              style={{ margin: '4px 0' }}
              label={
                <Typography variant="caption">Je reconnais avoir lu et j'accepte les conditions ci-dessus</Typography>
              }
            />
          </FormGroup>
        </DialogContent>
      )}

      <DialogActions>
        <Button disabled={loading} onClick={handleClose} color="secondary">
          {exportResponse === null ? 'Annuler' : 'Fermer'}
        </Button>
        {exportResponse === null && (
          <Button
            disabled={loading || !cohortId || !settings.motif || !settings.conditions || !settings.tables.length}
            onClick={handleSubmit}
            color="primary"
          >
            {loading ? <CircularProgress size={20} /> : 'Exporter les données'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ExportModal
