import React, { useEffect, useState } from 'react'

import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormGroup,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography
} from '@material-ui/core'

import CloseIcon from '@material-ui/icons/Close'

import { CohortType } from 'services/myProjects'

import useStyle from './styles'

import exportTableList from './export_table'

const INITIAL_SETTINGS_STATE = {
  access: false,
  allTable: true,
  selectedTable: exportTableList
}

type ExportModalProps = {
  open: boolean
  handleClose: () => void
  cohort: CohortType | null
}

const ExportModal: React.FC<ExportModalProps> = ({ open, handleClose, cohort }) => {
  const classes = useStyle()

  const [settings, setSettings] = useState(INITIAL_SETTINGS_STATE)

  useEffect(() => {
    setSettings(INITIAL_SETTINGS_STATE)
  }, [open])

  const handleChangeSettings = (key: 'access' | 'allTable' | 'selectedTable', value: any) => {
    switch (key) {
      case 'selectedTable': {
        const selectedTables = settings.selectedTable ? [...settings.selectedTable] : []
        const foundItem = selectedTables.find(
          (selectedTable: { name: string; table_id: string }) => selectedTable.table_id === value
        )
        const index = foundItem ? selectedTables.indexOf(foundItem) : -1
        if (index === -1) {
          const newItem = exportTableList.find(
            (exportTableItem: { name: string; table_id: string }) => exportTableItem.table_id === value
          )
          if (!newItem) return

          setSettings((prevState) => ({
            ...prevState,
            selectedTable: [...prevState.selectedTable, newItem]
          }))
        } else {
          selectedTables.splice(index, 1)
          setSettings({ ...settings, selectedTable: selectedTables })
        }
        break
      }
      case 'allTable':
        setSettings((prevState) => ({
          ...prevState,
          allTable: value,
          selectedTable: value !== false ? exportTableList : []
        }))
        break
      default:
        setSettings((prevState) => ({
          ...prevState,
          [key]: value
        }))
        break
    }
  }

  return (
    <Dialog
      maxWidth="sm"
      fullWidth
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={cohort ? open : false}
    >
      {cohort && (
        <>
          <DialogTitle disableTypography>
            <Typography variant="h6">{cohort?.name ? `Exporter : ${cohort?.name}` : ''}</Typography>

            <IconButton aria-label="close" className={classes.closeButton} onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent className={classes.dialogContent} dividers>
            <FormGroup>
              <FormControlLabel
                style={{ justifyContent: 'space-between' }}
                labelPlacement="start"
                control={
                  <Checkbox
                    checked={settings.access}
                    onChange={(e) => handleChangeSettings('access', e.target.checked)}
                    name="access"
                  />
                }
                label="Annominysation des données personnelles"
              />

              <FormControlLabel
                style={{ justifyContent: 'space-between' }}
                labelPlacement="start"
                control={
                  <Checkbox
                    checked={settings.allTable}
                    onChange={(e) => handleChangeSettings('allTable', e.target.checked)}
                    name="all-table"
                  />
                }
                label="Exporter toutes les tables de la base de donnée"
              />

              {!settings.allTable && (
                <List className={classes.list}>
                  {exportTableList.map((exportTableItem: { name: string; table_id: string }) => (
                    <ListItem className={classes.listItem} key={exportTableItem.table_id}>
                      <ListItemText primary={exportTableItem.name} secondary={exportTableItem.table_id} />
                      <ListItemSecondaryAction>
                        <Checkbox
                          checked={
                            settings.selectedTable
                              ? !!settings.selectedTable.find(({ table_id }) => table_id === exportTableItem.table_id)
                              : false
                          }
                          onChange={() => handleChangeSettings('selectedTable', exportTableItem.table_id)}
                          name="all-table"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </FormGroup>
          </DialogContent>

          <DialogActions className={classes.dialogActions}>
            <Button autoFocus onClick={handleClose} color="primary">
              Save changes
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}

export default ExportModal
