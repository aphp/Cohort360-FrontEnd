import React, { useState, useEffect } from 'react'

import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Checkbox from '@material-ui/core/Checkbox'
import Switch from '@material-ui/core/Switch'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

import useStyles from './styles'

import export_table from './export_table'

const initialState = {
  motif: '',
  conditions: false,
  tables: export_table.map(({ table_id }) => table_id)
}

type ExportModalProps = {
  cohortId: string
  open: boolean
  handleClose: () => void
}

const ExportModal: React.FC<ExportModalProps> = ({ cohortId, open, handleClose }) => {
  const classes = useStyles()
  const [settings, setSettings] = useState(initialState)

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
    setSettings((prevState) => ({
      ...prevState,
      [key]: value
    }))
  }

  const handleSubmit = () => {
    console.log('settings :>> ', settings)
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title-export">
      <DialogTitle id="form-dialog-export-title" disableTypography>
        <Typography>Export</Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Pour effectuer un export de donnée, veillez renseigner un motif, selectionner les tables que vous voulez
          exporter et accepter les conditions de l'entrepôt de données (EDS). <br />
          Tous les champs sont obligatoires
        </DialogContentText>

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

          <Typography className={classes.tableTitle} variant="h6">
            Tables exportées
          </Typography>

          <List className={classes.list}>
            <ListItem className={classes.tableListElement}>
              <ListItemText primary="Toutes les tables" />
              <ListItemSecondaryAction>
                <Checkbox
                  checked={settings.tables.length === export_table.length}
                  indeterminate={settings.tables.length === export_table.length ? false : settings.tables.length}
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
                <ListItemText primary={table_name} secondary={table_id} />
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
            label="Je reconnais avoir lu et j'accepte les conditions de l'EDS"
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
