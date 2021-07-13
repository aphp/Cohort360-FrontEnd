import React, { useState, useEffect } from 'react'

import Alert from '@material-ui/lab/Alert'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
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
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

import InfoIcon from '@material-ui/icons/Info'

import useStyles from './styles'

import export_table from './export_table'
import { createExport } from 'services/export'

const initialState = {
  motif: '',
  conditions: {
    necessary: false,
    not_export: false,
    restricted: false,
    destruction: false,
    not_communicate: false,
    inform: false,
    cnil: false
  },
  tables: export_table.map(({ table_id }) => table_id)
}
const ERROR_MOTIF: 'ERROR_MOTIF' = 'ERROR_MOTIF'
const ERROR_CONDITION: 'ERROR_CONDITION' = 'ERROR_CONDITION'
const ERROR_TABLE: 'ERROR_TABLE' = 'ERROR_TABLE'

type ExportModalProps = {
  cohortId: string
  open: boolean
  handleClose: () => void
}

const ExportModal: React.FC<ExportModalProps> = ({ cohortId, open, handleClose }) => {
  const classes = useStyles()
  const [settings, setSettings] = useState(initialState)
  const [error, setError] = useState<typeof ERROR_MOTIF | typeof ERROR_CONDITION | typeof ERROR_TABLE | null>(null)

  console.log('settings :>> ', settings)

  const conditions: boolean =
    !!settings?.conditions?.necessary &&
    !!settings?.conditions?.not_export &&
    !!settings?.conditions?.restricted &&
    !!settings?.conditions?.destruction &&
    !!settings?.conditions?.not_communicate &&
    !!settings?.conditions?.inform &&
    !!settings?.conditions?.cnil

  useEffect(() => {
    setSettings(initialState)
  }, [open])

  const handleChangeTables = (tableId: string) => {
    let existingTableIds: string[] = settings.tables
    const foundItem = existingTableIds.find((existingTableId) => existingTableId === tableId)
    if (foundItem) {
      const index = existingTableIds.indexOf(foundItem)
      existingTableIds.splice(index, 1)
    } else {
      existingTableIds = [...existingTableIds, tableId]
    }
    handleChangeSettings('tables', existingTableIds)
  }

  const handleChangeSettings = (
    key:
      | 'motif'
      | 'conditions.necessary'
      | 'conditions.not_export'
      | 'conditions.restricted'
      | 'conditions.destruction'
      | 'conditions.not_communicate'
      | 'conditions.inform'
      | 'conditions.cnil'
      | 'tables',
    value: any
  ) => {
    setError(null)
    switch (key) {
      case 'conditions.necessary':
      case 'conditions.not_export':
      case 'conditions.restricted':
      case 'conditions.destruction':
      case 'conditions.not_communicate':
      case 'conditions.inform':
      case 'conditions.cnil': {
        const newKey = key.split('.')[1]
        setSettings((prevState) => ({
          ...prevState,
          conditions: {
            ...prevState.conditions,
            [newKey]: value
          }
        }))
        break
      }
      default:
        setSettings((prevState) => ({
          ...prevState,
          [key]: value
        }))
        break
    }
  }

  const handleSubmit = () => {
    settings.motif = settings?.motif ? settings?.motif.trim() : ''

    const conditions: boolean =
      !!settings?.conditions?.necessary &&
      !!settings?.conditions?.restricted &&
      !!settings?.conditions?.destruction &&
      !!settings?.conditions?.not_communicate &&
      !!settings?.conditions?.inform &&
      !!settings?.conditions?.cnil

    if (!settings?.motif || settings?.motif.length <= 10) {
      return setError(ERROR_MOTIF)
    } else if (!conditions) {
      return setError(ERROR_CONDITION)
    } else if (!settings?.tables || (settings?.tables && settings?.tables.length == 0)) {
      return setError(ERROR_TABLE)
    }

    createExport({
      cohortId,
      motivation: settings?.motif,
      tables: settings?.tables
    })
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title-export">
      <DialogTitle id="form-dialog-export-title" disableTypography>
        <Typography>Export</Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Pour effectuer un export de données, veillez renseigner un motif, selectionner les tables que vous voulez
          exporter et accepter les conditions de l'entrepôt de données (EDS). <br />
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
            <ListItem className={classes.tableListElement}>
              <ListItemText primary="Toutes les tables" />
              <ListItemSecondaryAction>
                <Checkbox
                  checked={settings.tables.length === export_table.length}
                  indeterminate={settings.tables.length === export_table.length ? false : !!settings.tables.length}
                  onChange={() =>
                    handleChangeSettings(
                      'tables',
                      settings.tables.length ? [] : export_table.map(({ table_id }) => table_id)
                    )
                  }
                />
              </ListItemSecondaryAction>
            </ListItem>
            {export_table.map(({ table_name, table_id }) => (
              <ListItem className={classes.tableListElement} key={table_id}>
                <ListItemText primary={table_name} />
                <ListItemSecondaryAction>
                  <Checkbox
                    checked={!!settings.tables.find((tableId) => tableId === table_id)}
                    onChange={() => handleChangeTables(table_id)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          <Typography variant="caption">
            Le niveau d’habilitation dont vous disposez dans Cohort360 vous autorise à exporter des données à caractère
            personnel conformément à la réglementation et aux règles institutionnelles d’utilisation des données du
            Système d’Information du domaine Patient de l’AP-HP. Vous êtes garant des données exportées et vous engagez
            à :
          </Typography>

          <FormControlLabel
            control={
              <Switch
                name="conditions-necessary"
                value={settings.conditions.necessary}
                onChange={() => handleChangeSettings('conditions.necessary', !settings.conditions.necessary)}
              />
            }
            labelPlacement="end"
            style={{ margin: '4px 0' }}
            label={
              <Typography variant="caption">
                N’exporter, parmi les catégories de données accessibles, que les données strictement nécessaires et
                pertinentes au regard des objectifs de la recherche
              </Typography>
            }
          />

          <FormControlLabel
            control={
              <Switch
                name="conditions-restricted"
                value={settings.conditions.restricted}
                onChange={() => handleChangeSettings('conditions.restricted', !settings.conditions.restricted)}
              />
            }
            labelPlacement="end"
            style={{ margin: '4px 0' }}
            label={
              <Typography variant="caption">
                A stocker temporairement les données extraites sur un répertoire dont l’accès est techniquement
                restreint aux personnes dûment habilitées et authentifiées, présentes dans les locaux du responsable de
                la recherche.
              </Typography>
            }
          />

          <FormControlLabel
            control={
              <Switch
                name="conditions-not_export"
                value={settings.conditions.not_export}
                onChange={() => handleChangeSettings('conditions.not_export', !settings.conditions.not_export)}
              />
            }
            labelPlacement="end"
            style={{ margin: '4px 0' }}
            label={
              <Typography variant="caption">
                A ne pas utiliser du matériel ou des supports de stockage n’appartenant pas à l’AP-HP, à ne pas sortir
                les données des locaux de l’AP-HP ou sur un support amovible emporté hors AP-HP.
              </Typography>
            }
          />

          <FormControlLabel
            control={
              <Switch
                name="conditions-destruction"
                value={settings.conditions.destruction}
                onChange={() => handleChangeSettings('conditions.destruction', !settings.conditions.destruction)}
              />
            }
            labelPlacement="end"
            style={{ margin: '4px 0' }}
            label={
              <Typography variant="caption">
                A procéder à la destruction de toutes données exportées, dès qu’il n’y a plus nécessité d’en disposer
                dans le cadre de la recherche dans le périmètre concerné.
              </Typography>
            }
          />

          <FormControlLabel
            control={
              <Switch
                name="conditions-not_communicate"
                value={settings.conditions.not_communicate}
                onChange={() =>
                  handleChangeSettings('conditions.not_communicate', !settings.conditions.not_communicate)
                }
              />
            }
            labelPlacement="end"
            style={{ margin: '4px 0' }}
            label={
              <Typography variant="caption">A ne pas communiquer les données à des tiers non autorisés</Typography>
            }
          />

          <FormControlLabel
            control={
              <Switch
                name="conditions-inform"
                value={settings.conditions.inform}
                onChange={() => handleChangeSettings('conditions.inform', !settings.conditions.inform)}
              />
            }
            labelPlacement="end"
            style={{ margin: '4px 0' }}
            label={
              <Typography variant="caption">
                A informer les chefs de services des UF de Responsabilité où ont été collectées les données exportées
              </Typography>
            }
          />

          <FormControlLabel
            control={
              <Switch
                name="conditions-cnil"
                value={settings.conditions.cnil}
                onChange={() => handleChangeSettings('conditions.cnil', !settings.conditions.cnil)}
              />
            }
            labelPlacement="end"
            style={{ margin: '4px 0' }}
            label={
              <Typography variant="caption">
                A ne pas croiser les données avec tout autre jeu de données, sans autorisation auprès de la CNIL
              </Typography>
            }
          />
        </FormGroup>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Annuler
        </Button>
        <Button
          disabled={!cohortId || !settings.motif || !conditions || !settings.tables.length}
          onClick={handleSubmit}
          color="primary"
        >
          Exporter les données
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ExportModal
