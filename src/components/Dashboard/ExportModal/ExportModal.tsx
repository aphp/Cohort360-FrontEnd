import React, { useState, useEffect, useRef } from 'react'
import { isAxiosError } from 'axios'

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormGroup,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
  Typography,
  Autocomplete,
  RadioGroup,
  Radio
} from '@mui/material'

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CancelIcon from '@mui/icons-material/Cancel'
import WarningIcon from '@mui/icons-material/Warning'
import InfoIcon from '@mui/icons-material/Info'

import useStyles from './styles'

import export_table from './export_table'
import services from 'services/aphp'
import { ExportCSVForm, ExportCSVTable, SavedFilter } from 'types'
import { useAppSelector } from 'state'
import { ResourceType } from 'types/requestCriterias'
import { getProviderFilters } from 'services/aphp/serviceFilters'
import { ExportTableAccordion, ExportTableAccordionSummary } from './ExportTableAccordion'
import { IndeterminateCheckBoxOutlined } from '@mui/icons-material'
import { MAIL_SUPPORT } from '../../../constants'

const initialState: ExportCSVForm = {
  motif: '',
  conditions: false,
  tables: export_table.map<ExportCSVTable>((table) => ({
    ...table,
    checked: table.label === 'person' ? true : false,
    fhir_filter: null,
    respect_table_relationships: true
  }))
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
  const { classes } = useStyles()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState(initialState)
  const checkedTables = settings.tables.filter((table) => table.checked)

  const [exportResponse, setExportResponse] = useState<{ status: 'error' | 'finish'; detail: string } | null>(null)
  const [error, setError] = useState<typeof ERROR_MOTIF | typeof ERROR_CONDITION | typeof ERROR_TABLE | null>(null)
  const [expandedTableIds, setExpandedTableIds] = useState<string[]>([])

  const dialogRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    setSettings(initialState)
    setExportResponse(null)
    setLoading(false)
    setError(null)
  }, [open])

  const handleSelectAllTables = () => {
    handleChangeSettings(
      'tables',
      settings.tables.map<ExportCSVTable>((table) => ({
        ...table,
        checked: table.label !== 'person' ? settings.tables.length !== checkedTables.length : true
      }))
    )
  }

  const handleChangeTables = (tableId: string) => {
    let existingTables: ExportCSVTable[] = settings.tables

    existingTables = existingTables.map((table) => ({
      ...table,
      checked: table.label === tableId ? !table.checked : table.checked
    }))

    handleChangeSettings('tables', existingTables)
  }

  const handleChangeSettings = (key: 'motif' | 'conditions' | 'tables', value: ExportCSVTable[] | string | boolean) => {
    setError(null)
    setSettings((prevState) => ({
      ...prevState,
      [key]: value
    }))
  }

  const handleExpandedTable = (tableId: string, resourceType: ResourceType) => {
    if (resourceType !== ResourceType.UNKNOWN) {
      setExpandedTableIds((prevExpandedTableIds) => {
        if (prevExpandedTableIds.includes(tableId)) {
          return prevExpandedTableIds.filter((id) => id !== tableId)
        } else {
          return [...prevExpandedTableIds, tableId]
        }
      })
    }
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
      tables: (settings?.tables || []).filter((table) => table.checked)
    })

    if (isAxiosError(response)) {
      setExportResponse({ status: 'error', detail: response.message })
    } else {
      setExportResponse({ status: 'finish', detail: '' })
    }
    setLoading(false)
  }

  function renderExportTable(exportTable: ExportCSVTable) {
    const { id, name, checked, subtitle, label, resourceType } = exportTable
    const isItemExpanded = expandedTableIds.includes(label)

    return (
      <ExportTableAccordion
        key={label}
        expanded={isItemExpanded}
        onChange={() => handleExpandedTable(label, resourceType)}
      >
        <ExportTableAccordionSummary
          style={resourceType === ResourceType.UNKNOWN ? { cursor: 'default' } : {}}
          expandIcon={
            <Checkbox
              disabled={label === 'person'}
              color="secondary"
              checked={checked}
              className={classes.checkbox}
              onClick={(e) => {
                e.stopPropagation()
                handleChangeTables(label)
              }}
            />
          }
          aria-controls={`panel-${name}-content`}
          id={`panel-${name}-handler`}
        >
          <Grid item container alignItems="center">
            <Typography
              variant="subtitle2"
              className={isItemExpanded ? classes.selectedTable : classes.notSelectedTable}
            >
              {name} &nbsp; {'['}
            </Typography>
            <Typography variant="h6" className={classes.tableCode}>
              {label}
            </Typography>
            <Typography
              variant="subtitle2"
              className={isItemExpanded ? classes.selectedTable : classes.notSelectedTable}
            >
              {']'}
            </Typography>
            {subtitle && (
              <Grid container alignItems="center">
                <Typography className={classes.tableSubtitle} variant="body1">
                  {subtitle}
                </Typography>
              </Grid>
            )}
          </Grid>
        </ExportTableAccordionSummary>
        {resourceType !== ResourceType.UNKNOWN && (
          <AccordionDetails className={classes.accordionContent}>
            <ExportTable
              key={name}
              exportTable={exportTable}
              exportRequest={settings}
              handleTransferRequestChange={setSettings}
            />
          </AccordionDetails>
        )}
      </ExportTableAccordion>
    )
  }

  return (
    <Dialog open={loading || open} onClose={handleClose} aria-labelledby="form-dialog-title-export" maxWidth="md">
      <DialogTitle className={classes.dialogTitle} id="form-dialog-export-title">
        Demande d'export
      </DialogTitle>

      {exportResponse !== null ? (
        <DialogContent ref={dialogRef}>
          {exportResponse.status === 'finish' ? (
            <Grid container alignItems="center" justifyContent="space-between">
              <CheckCircleOutlineIcon style={{ fontSize: 52 }} htmlColor="#BDEA88" />
              <DialogContentText style={{ marginBottom: 0, width: 'calc(100% - 62px)' }}>
                Votre demande d'export a bien été prise en compte. Vous recevrez un email de confirmation prochainement.
              </DialogContentText>
            </Grid>
          ) : (
            <Grid container alignItems="center" justifyContent="space-between">
              <CancelIcon style={{ fontSize: 52 }} htmlColor="#FC5656" />
              <DialogContentText style={{ marginBottom: 0, width: 'calc(100% - 62px)' }}>
                Une erreur est survenue lors de votre demande d'export. Veuillez{' '}
                <a href={`mailto:${MAIL_SUPPORT}`}>contacter le support</a> pour plus d'informations
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
        <DialogContent ref={dialogRef} className={classes.dialogContent}>
          <DialogContentText>
            Pour effectuer un export de données, veuillez renseigner un motif, selectionner uniquement les tables que
            vous voulez exporter et accepter les conditions de l'entrepôt de données de santé (EDS). <br />
            Tous les champs sont obligatoires
          </DialogContentText>

          <Grid mb="12px">
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
              minRows={3}
              maxRows={5}
              value={settings.motif}
              helperText="Le motif doit comporter au moins 10 caractères"
              FormHelperTextProps={{ className: classes.helperText }}
              label="Motif de l'export"
              variant="filled"
              onChange={(e) => handleChangeSettings('motif', e.target.value)}
            />

            <Grid className={classes.warningInfo} container alignItems="center">
              <WarningIcon className={classes.warningIcon} color="warning" fontSize="small" />
              <Typography className={classes.warningNote}>
                La biologie (table <i>measurement</i>) et les comptes-rendus (table <i>note</i>) ne sont pas disponibles
                à l’export csv.
              </Typography>
            </Grid>

            <Grid container py="28px" gap="16px">
              <Grid item container alignItems="center" flexWrap="nowrap" pr="33px">
                <Grid item container>
                  <Typography className={classes.dialogHeader} variant="h5">
                    Tables exportées
                  </Typography>

                  <IconButton size="small" onClick={() => window.open(`https://doc.eds.aphp.fr/omop/tables`, '_blank')}>
                    <InfoIcon />
                  </IconButton>
                </Grid>

                <Grid item whiteSpace="nowrap">
                  <FormControlLabel
                    className={classes.selectAllTables}
                    control={
                      <Checkbox
                        color="secondary"
                        className={classes.checkbox}
                        indeterminate={
                          settings.tables.filter((table) => table.checked).length !== settings.tables.length &&
                          settings.tables.filter((table) => table.checked).length > 0
                        }
                        indeterminateIcon={<IndeterminateCheckBoxOutlined style={{ color: 'rgba(0,0,0,0.6)' }} />}
                        checked={settings.tables.filter((table) => table.checked).length === settings.tables.length}
                        onChange={handleSelectAllTables}
                      />
                    }
                    label={
                      settings.tables.filter((table) => table.checked).length === settings.tables.length
                        ? 'Tout désélectionner'
                        : 'Tout sélectionner'
                    }
                    labelPlacement="start"
                  />
                </Grid>
              </Grid>
              <Grid item container>
                {settings.tables.map(renderExportTable)}
              </Grid>
            </Grid>

            <Grid container gap="12px" pb="10px">
              <Typography className={classes.dialogHeader} variant="h5">
                Conditions de l'EDS
              </Typography>

              <Grid item container gap="8px">
                <Typography variant="caption" className={classes.textBody2}>
                  Le niveau d’habilitation dont vous disposez dans Cohort360 vous autorise à exporter des données à
                  caractère personnel conformément à la réglementation et aux règles institutionnelles d’utilisation des
                  données du Système d’Information clinique de l’AP-HP. Vous êtes garant des données exportées et vous
                  vous engagez à :
                </Typography>
                <Grid item container>
                  <Typography variant="caption" className={classes.conditionItem}>
                    N’exporter, parmi les catégories de données accessibles, que les données strictement nécessaires et
                    pertinentes au regard des objectifs de la recherche
                  </Typography>

                  <Typography variant="caption" className={classes.conditionItem}>
                    A stocker temporairement les données extraites sur un répertoire dont l’accès est techniquement
                    restreint aux personnes dûment habilitées et authentifiées, présentes dans les locaux du responsable
                    de la recherche.
                  </Typography>

                  <Typography variant="caption" className={classes.conditionItem}>
                    A ne pas utiliser du matériel ou des supports de stockage n’appartenant pas à l’AP-HP, à ne pas
                    sortir les données des locaux de l’AP-HP ou sur un support amovible emporté hors AP-HP.
                  </Typography>
                  <Typography variant="caption" className={classes.conditionItem}>
                    A procéder à la destruction de toutes données exportées, dès qu’il n’y a plus nécessité d’en
                    disposer dans le cadre de la recherche dans le périmètre concerné.
                  </Typography>

                  <Typography variant="caption" className={classes.conditionItem}>
                    A ne pas communiquer les données à des tiers non autorisés
                  </Typography>

                  <Typography variant="caption" className={classes.conditionItem}>
                    A informer les chefs de services des UF de Responsabilité où ont été collectées les données
                    exportées
                  </Typography>

                  <Typography variant="caption" className={classes.conditionItem}>
                    A ne pas croiser les données avec tout autre jeu de données, sans autorisation auprès de la CNIL
                  </Typography>
                </Grid>

                <FormControlLabel
                  className={classes.selectAgreeConditions}
                  control={
                    <Checkbox
                      color="secondary"
                      className={classes.agreeCheckbox}
                      name="conditions"
                      checked={settings.conditions}
                      onChange={() => handleChangeSettings('conditions', !settings.conditions)}
                    />
                  }
                  labelPlacement="end"
                  label={
                    <Typography variant="caption" className={classes.textBody1}>
                      Je reconnais avoir lu et j'accepte les conditions ci-dessus
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </FormGroup>
        </DialogContent>
      )}

      <DialogActions>
        <Button disabled={loading} onClick={handleClose} color="secondary">
          {exportResponse === null ? 'Annuler' : 'Fermer'}
        </Button>
        {exportResponse === null && (
          <Button
            disabled={
              loading ||
              !cohortId ||
              !settings.motif ||
              !settings.conditions ||
              !settings.tables.filter((table) => table.checked).length
            }
            onClick={handleSubmit}
          >
            {loading ? <CircularProgress size={20} /> : 'Exporter les données'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ExportModal

type ExportTableProps = {
  exportTable: ExportCSVTable
  exportRequest: ExportCSVForm
  handleTransferRequestChange: (newExportRequest: ExportCSVForm) => void
}

const ExportTable: React.FC<ExportTableProps> = ({ exportTable, exportRequest, handleTransferRequestChange }) => {
  const { classes } = useStyles()

  const [filtersOptions, setFiltersOptions] = useState<SavedFilter[]>([])

  const meState = useAppSelector((state) => state.me)
  const userId = meState?.id

  const _onChangeValue = (value: SavedFilter | null) => {
    const _transferRequest = { ...exportRequest }

    const exportTableIndex = exportRequest.tables.findIndex((table) => table.id === exportTable.id)

    _transferRequest.tables[exportTableIndex] = {
      ...exportRequest.tables[exportTableIndex],
      fhir_filter: value
    }
    handleTransferRequestChange(_transferRequest)
  }

  useEffect(() => {
    const _getProviderFilters = async () => {
      try {
        const filtersResp = await getProviderFilters(userId, exportTable.resourceType)

        setFiltersOptions(filtersResp)
      } catch (error) {
        console.error("Erreur lors de la récupération des filtres de l'utilisateur", error)
        setFiltersOptions([])
      }
    }

    _getProviderFilters()
  }, [])

  return (
    <Grid item container padding="0" gap="16px">
      <Grid item container alignItems="center" justifyContent="space-between">
        <Grid item xs={5}>
          <Typography className={classes.textBody2}>Filtrer cette table avec un filtre :</Typography>
        </Grid>
        <Grid item xs={6}>
          <Autocomplete
            className={classes.autocomplete}
            size="small"
            disabled={meState?.maintenance?.active}
            options={filtersOptions}
            noOptionsText="Aucun filtre disponible"
            getOptionLabel={(option) => `Filtre: ${option.name}`}
            renderOption={(props, option) => <li {...props}>{option.name}</li>}
            renderInput={(params) => <TextField {...params} label="Sélectionnez un filtre" />}
            value={exportTable.fhir_filter}
            onChange={(_, value) => _onChangeValue(value)}
          />
        </Grid>
      </Grid>
      <Grid item container alignItems="center" justifyContent="space-between" display="none">
        <Grid item xs={5}>
          <Typography className={classes.textBody2}>
            Filtrer cette table en respectant les contraintes relationnelles avec les autres tables sélectionnées:
          </Typography>
        </Grid>
        <Grid item container xs={6} justifyContent="space-between">
          <RadioGroup
            row
            aria-labelledby="contraintes-relationnelles-label"
            defaultValue="Oui"
            name="contraintes-relationnelles"
            className={classes.radioGroup}
          >
            <Grid item xs={6}>
              <FormControlLabel disabled value="Non" control={<Radio />} label={'Non'} />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel value="Oui" control={<Radio />} label={'Oui'} />
            </Grid>
          </RadioGroup>
        </Grid>
      </Grid>
    </Grid>
  )
}
