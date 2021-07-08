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
  conditions: false,
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

  const handleChangeSettings = (key: 'motif' | 'conditions' | 'tables', value: any) => {
    setError(null)
    setSettings((prevState) => ({
      ...prevState,
      [key]: value
    }))
  }

  const handleSubmit = () => {
    settings.motif = settings?.motif ? settings?.motif.trim() : ''

    if (!settings?.motif || settings?.motif.length <= 10) {
      return setError(ERROR_MOTIF)
    } else if (!settings?.conditions) {
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
            <Alert severity="error">Merci d'accepter les conditions de l'Entrepôts de données de santé</Alert>
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

          <FormControlLabel
            control={
              <Switch
                name="conditions"
                value={settings.conditions}
                onChange={() => handleChangeSettings('conditions', !settings.conditions)}
              />
            }
            labelPlacement="start"
            label={
              <Typography>
                Je reconnais avoir lu et j'accepte les <a href={'/toto'}>conditions de l'EDS</a>
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
          disabled={!cohortId || !settings.motif || !settings.conditions || !settings.tables.length}
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
