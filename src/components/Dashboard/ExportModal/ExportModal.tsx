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
  Radio,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material'

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CancelIcon from '@mui/icons-material/Cancel'
import InfoIcon from '@mui/icons-material/Info'

import useStyles from './styles'

import export_table, { label } from './export_table'
import services from 'services/aphp'
import { ExportCSVForm, ExportCSVTable, SavedFilter } from 'types'
import { useAppSelector } from 'state'
import { ResourceType } from 'types/requestCriterias'
import { getProviderFilters } from 'services/aphp/serviceFilters'
import { ExportTableAccordion, ExportTableAccordionSummary } from './ExportTableAccordion'
import { IndeterminateCheckBoxOutlined } from '@mui/icons-material'
import { EXPORT_LINES_LIMIT, MAIL_SUPPORT } from '../../../constants'
import { fetchResourceCount, fetchAllResourcesCount, getRightCount, ResourcesWithExportTables } from './exportUtils'

const initialState: ExportCSVForm = {
  motif: '',
  conditions: false,
  tables: export_table.map<ExportCSVTable>((table) => ({
    ...table,
    checked: table.label === 'person',
    fhir_filter: null,
    respect_table_relationships: true,
    count: 0
  }))
}

const resourcesWithNoFilters = [ResourceType.ENCOUNTER, ResourceType.QUESTIONNAIRE_RESPONSE, ResourceType.UNKNOWN]

enum Error {
  ERROR_MOTIF,
  ERROR_CONDITION,
  ERROR_TABLE,
  ERROR_TABLE_LIMIT,
  ERROR_FETCH
}

type ExportModalProps = {
  cohortId: string
  fhirGroupId: string
  open: boolean
  handleClose: () => void
}

const ExportModal: React.FC<ExportModalProps> = ({ cohortId, fhirGroupId, open, handleClose }) => {
  const { classes } = useStyles()
  const [loading, setLoading] = useState(false)
  const [countLoading, setCountLoading] = useState<boolean | string>(false)
  const [settings, setSettings] = useState(initialState)
  const checkedTables = settings.tables.filter((table) => table.checked)

  const [exportResponse, setExportResponse] = useState<{ status: 'error' | 'finish'; detail: string } | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [expandedTableIds, setExpandedTableIds] = useState<string[]>(['person'])

  const dialogRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    setSettings(initialState)
    setExportResponse(null)
    setLoading(false)
    setError(null)
    setExpandedTableIds(['person'])
    if (open) {
      getResourcesCount()
    }
  }, [open])

  useEffect(() => {
    setError(
      settings.tables.some((table) => {
        return (
          table.checked && table.count > (table.resourceType === ResourceType.DOCUMENTS ? 5000 : EXPORT_LINES_LIMIT)
        )
      })
        ? Error.ERROR_TABLE_LIMIT
        : null
    )
  }, [settings])

  const getResourcesCount = async () => {
    try {
      setCountLoading(true)
      const counts = await fetchAllResourcesCount(fhirGroupId)

      const tablesWithCount = {
        ...initialState,
        tables: initialState.tables.map((table) => ({
          ...table,
          count: getRightCount(counts, table.resourceType as ResourcesWithExportTables)
        }))
      }

      setSettings(tablesWithCount)
    } catch (error) {
      console.error('Erreur lors du fetch du count de toutes les ressources', error)
      setError(Error.ERROR_FETCH)
    } finally {
      setCountLoading(false)
    }
  }

  const [isChecked, setIsChecked] = useState(false)
  const [selectState, setSelectState] = useState<'csv' | 'xlsx'>('csv')

  const compatibilities = (exportTable: ExportCSVTable) => {
    const checkedResources = checkedTables.map((table) => {
      const com = table.compatibleResourceTypes
      return com
    })
    const findCompatibilities = (checkedResourcesCompatibilities: label[][]) => {
      let smallestArray = checkedResourcesCompatibilities[0]
      for (let i = 1; i < checkedResourcesCompatibilities.length; i++) {
        if (checkedResourcesCompatibilities[i].length < smallestArray.length) {
          smallestArray = checkedResourcesCompatibilities[i]
        }
      }
      return smallestArray
    }
    const resourceCompatibilities = findCompatibilities(checkedResources)

    return !resourceCompatibilities.includes(exportTable.label)
  }

  const resetSelectedTables = () => {
    const newSelectedTables = settings.tables.map<ExportCSVTable>((table) => ({
      ...table,
      checked: table.label === 'person'
    }))
    handleChangeSettings('tables', newSelectedTables)
    setExpandedTableIds(['person'])
  }

  const handleSelectAllTables = () => {
    const newSelectedTables = settings.tables.map<ExportCSVTable>((table) => ({
      ...table,
      checked: table.label !== 'person' ? settings.tables.length !== checkedTables.length : true
    }))
    handleChangeSettings('tables', newSelectedTables)

    setExpandedTableIds(
      newSelectedTables
        .filter(
          (table) =>
            table.checked &&
            (table.count > (table.resourceType === ResourceType.DOCUMENTS ? 5000 : EXPORT_LINES_LIMIT) ||
              !resourcesWithNoFilters.includes(table.resourceType))
        )
        .map((table) => table.label)
    )
  }

  const handleChangeTables = (selectedTable: ExportCSVTable) => {
    let existingTables: ExportCSVTable[] = settings.tables

    existingTables = existingTables.map((table) => ({
      ...table,
      checked: table.label === selectedTable.label ? !table.checked : table.checked
    }))

    const expandableTables = !resourcesWithNoFilters.includes(selectedTable.resourceType)
    const isSelectedTableChecked = existingTables.find((table) => table.label === selectedTable.label)?.checked

    if (expandableTables) {
      setExpandedTableIds(
        isSelectedTableChecked
          ? [...expandedTableIds, selectedTable.label]
          : [...expandedTableIds.filter((tableId) => tableId !== selectedTable.label)]
      )
    }
    handleChangeSettings('tables', existingTables)
  }

  const handleChangeSettings = (key: 'motif' | 'conditions' | 'tables', value: ExportCSVTable[] | string | boolean) => {
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

    const response = await services.cohorts.createExport({
      cohortId,
      motivation: settings?.motif,
      tables: (settings?.tables || []).filter((table) => table.checked),
      outputFormat: selectState,
      group_tables: isChecked
    })

    if (isAxiosError(response)) {
      setExportResponse({ status: 'error', detail: response.message })
    } else {
      setExportResponse({ status: 'finish', detail: '' })
    }
    setLoading(false)
  }

  function renderExportTable(exportTable: ExportCSVTable) {
    const { name, checked, label, resourceType, count } = exportTable
    const isItemExpanded = expandedTableIds.includes(label)
    const _countLoading = !!((countLoading && typeof countLoading === 'boolean') || countLoading === label)
    const setLimitError = resourceType === ResourceType.DOCUMENTS ? 5000 : EXPORT_LINES_LIMIT

    return (
      <ExportTableAccordion key={label} expanded={isItemExpanded} error={checked && count > setLimitError}>
        <ExportTableAccordionSummary
          style={resourcesWithNoFilters.includes(resourceType) ? { cursor: 'default' } : {}}
          expandIcon={
            <Checkbox
              disabled={isChecked ? compatibilities(exportTable) || label === 'person' : label === 'person'}
              color="secondary"
              checked={checked}
              className={classes.checkbox}
              onClick={(e) => {
                e.stopPropagation()
                handleChangeTables(exportTable)
              }}
            />
          }
          aria-controls={`panel-${name}-content`}
          id={`panel-${name}-handler`}
        >
          <Grid item container alignItems={'center'}>
            <Grid item container alignItems="center" xs={6}>
              <Typography variant="subtitle2" className={checked ? classes.selectedTable : classes.notSelectedTable}>
                {name} &nbsp;
              </Typography>
              <div>
                <Typography
                  variant="subtitle2"
                  className={checked ? classes.selectedTable : classes.notSelectedTable}
                  component="span"
                >
                  {'['}
                </Typography>
                <Typography variant="h6" className={classes.tableCode} component="span">
                  {label}
                </Typography>
                <Typography
                  variant="subtitle2"
                  className={checked ? classes.selectedTable : classes.notSelectedTable}
                  component="span"
                >
                  {']'}
                </Typography>
              </div>
            </Grid>
            <Typography
              variant="h3"
              width={'50%'}
              fontSize={12}
              textAlign={'center'}
              color={checked ? '#153D8A' : '#888'}
            >
              {!resourcesWithNoFilters.includes(resourceType) &&
                (_countLoading ? <CircularProgress size={15} /> : `${count} lignes`)}
            </Typography>
          </Grid>
        </ExportTableAccordionSummary>
        {!resourcesWithNoFilters.includes(resourceType) && (
          <AccordionDetails className={classes.accordionContent}>
            <ExportTable
              key={name}
              exportTable={exportTable}
              exportRequest={settings}
              handleTransferRequestChange={setSettings}
              cohortId={fhirGroupId}
              setCountLoading={setCountLoading}
              setError={setError}
            />
          </AccordionDetails>
        )}
      </ExportTableAccordion>
    )
  }

  const renderFetchErrorContent = () => (
    <DialogContent>
      <Grid container alignItems="center" justifyContent="space-between">
        <CancelIcon style={{ fontSize: 52 }} htmlColor="#FC5656" />
        <DialogContentText style={{ marginBottom: 0, width: 'calc(100% - 62px)' }}>
          Une erreur réseau empêche les exports de fonctionner correctement. Veuillez réessayer plus tard ou contacter
          le support ({MAIL_SUPPORT}) si l'erreur persiste.
        </DialogContentText>
      </Grid>
    </DialogContent>
  )

  const renderSuccessContent = () => (
    <Grid container alignItems="center" justifyContent="space-between">
      <CheckCircleOutlineIcon style={{ fontSize: 52 }} htmlColor="#BDEA88" />
      <DialogContentText style={{ marginBottom: 0, width: 'calc(100% - 62px)' }}>
        Votre demande d'export a bien été prise en compte. Vous recevrez un email de confirmation prochainement.
      </DialogContentText>
    </Grid>
  )

  const renderErrorContent = () => (
    <Grid container alignItems="center" justifyContent="space-between">
      <CancelIcon style={{ fontSize: 52 }} htmlColor="#FC5656" />
      <DialogContentText style={{ marginBottom: 0, width: 'calc(100% - 62px)' }}>
        Une erreur est survenue lors de votre demande d'export. Veuillez{' '}
        <a href={`mailto:${MAIL_SUPPORT}`}>contacter le support</a> pour plus d'informations
        {exportResponse?.detail && (
          <Accordion id="reason-accordion" square className={classes.accordion}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="reason-accordion"
              id="reason-accordion-summary"
            >
              <Typography className={classes.heading}>Motif :</Typography>
            </AccordionSummary>
            <AccordionDetails id="reason-accordion-details">
              <Typography>{exportResponse?.detail}</Typography>
            </AccordionDetails>
          </Accordion>
        )}
      </DialogContentText>
    </Grid>
  )

  const renderFormContent = () => (
    <DialogContent ref={dialogRef} className={classes.dialogContent}>
      <DialogContentText>
        Pour effectuer un export de données, veuillez renseigner un motif, sélectionner uniquement les tables que vous
        voulez exporter et accepter les conditions de l'entrepôt de données de santé (EDS). <br />
        Tous les champs sont obligatoires
      </DialogContentText>

      <Grid mb="12px">
        {error === Error.ERROR_MOTIF && (
          <Alert severity="error">
            Merci d'indiquer le motif de votre demande d'export, ce motif doit contenir au moins 10 caractères
          </Alert>
        )}

        {error === Error.ERROR_CONDITION && (
          <Alert severity="error">Merci d'accepter toutes les conditions de l'Entrepôt de données de santé</Alert>
        )}
        {error === Error.ERROR_TABLE && (
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

        <Grid>
          <FormControlLabel
            control={
              <Checkbox
                checked={isChecked}
                onClick={() => {
                  setIsChecked(!isChecked)
                  resetSelectedTables()
                }}
              />
            }
            label={'Regrouper plusieurs tables en un seul fichier'}
          />
          <Tooltip
            title={
              <span>
                Cette fonctionnalité permet d'intégrer, dans chaque fichier généré correspondant à une table
                sélectionnée, les données patient et visites associées.
              </span>
            }
          >
            <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
          </Tooltip>
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

            {!isChecked && (
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
            )}
          </Grid>
          <Grid item container>
            {settings.tables.map(renderExportTable)}
          </Grid>
        </Grid>

        <Grid container className={classes.referentielContainer}>
          <Typography variant="h3">Type de fichier : </Typography>
          <Select
            className={classes.select}
            style={{ height: 32 }}
            id="file-type-selector"
            value={selectState}
            onChange={(event) => setSelectState(event.target.value as 'csv' | 'xlsx')}
          >
            <MenuItem value={'csv'}>{'Fichier csv'}</MenuItem>
            <MenuItem value={'xlsx'}>{'Fichier exel (.xlsx)'}</MenuItem>
          </Select>
        </Grid>

        <Grid container gap="12px" pb="10px">
          <Typography className={classes.dialogHeader} variant="h5">
            Conditions de l'EDS
          </Typography>

          <Grid item container gap="8px">
            <Typography variant="caption" className={classes.textBody2}>
              Le niveau d’habilitation dont vous disposez dans Cohort360 vous autorise à exporter des données à
              caractère personnel conformément à la réglementation et aux règles institutionnelles d’utilisation des
              données du Système d’Information clinique de l’AP-HP. Vous êtes garant des données exportées et vous vous
              engagez à :
            </Typography>
            <Grid item container>
              <Typography variant="caption" className={classes.conditionItem}>
                N’exporter, parmi les catégories de données accessibles, que les données strictement nécessaires et
                pertinentes au regard des objectifs de la recherche
              </Typography>

              <Typography variant="caption" className={classes.conditionItem}>
                A stocker temporairement les données extraites sur un répertoire dont l’accès est techniquement
                restreint aux personnes dûment habilitées et authentifiées, présentes dans les locaux du responsable de
                la recherche.
              </Typography>

              <Typography variant="caption" className={classes.conditionItem}>
                A ne pas utiliser du matériel ou des supports de stockage n’appartenant pas à l’AP-HP, à ne pas sortir
                les données des locaux de l’AP-HP ou sur un support amovible emporté hors AP-HP.
              </Typography>
              <Typography variant="caption" className={classes.conditionItem}>
                A procéder à la destruction de toutes données exportées, dès qu’il n’y a plus nécessité d’en disposer
                dans le cadre de la recherche dans le périmètre concerné.
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
  )

  return (
    <Dialog open={loading || open} onClose={handleClose} aria-labelledby="form-dialog-title-export" maxWidth="md">
      <DialogTitle className={classes.dialogTitle} id="form-dialog-export-title">
        Demande d'export
      </DialogTitle>

      {error === Error.ERROR_FETCH ? (
        renderFetchErrorContent()
      ) : exportResponse !== null ? (
        <DialogContent ref={dialogRef}>
          {exportResponse.status === 'finish' ? renderSuccessContent() : renderErrorContent()}
        </DialogContent>
      ) : (
        renderFormContent()
      )}

      <DialogActions>
        <Button disabled={loading} onClick={handleClose} color="secondary">
          {exportResponse === null ? 'Annuler' : 'Fermer'}
        </Button>
        {exportResponse === null && (
          <Button
            disabled={
              loading ||
              !!countLoading ||
              !cohortId ||
              !settings.motif ||
              !settings.conditions ||
              !settings.tables.filter((table) => table.checked).length ||
              error === Error.ERROR_TABLE_LIMIT
            }
            onClick={handleSubmit}
          >
            {loading || countLoading ? <CircularProgress size={20} /> : 'Exporter les données'}
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
  cohortId: string
  setCountLoading: (loading: boolean | string) => void
  setError: (error: Error | null) => void
}

const ExportTable: React.FC<ExportTableProps> = ({
  exportTable,
  exportRequest,
  handleTransferRequestChange,
  cohortId,
  setCountLoading,
  setError
}) => {
  const { classes } = useStyles()

  const [filtersOptions, setFiltersOptions] = useState<SavedFilter[]>([])

  const meState = useAppSelector((state) => state.me)
  const userId = meState?.id

  const _onChangeValue = async (value: SavedFilter | null) => {
    try {
      const exportTableIndex = exportRequest.tables.findIndex((table) => table.id === exportTable.id)
      const _transferRequest = { ...exportRequest }

      setCountLoading(_transferRequest.tables[exportTableIndex].label)

      _transferRequest.tables[exportTableIndex] = {
        ...exportRequest.tables[exportTableIndex],
        fhir_filter: value,
        count: await fetchResourceCount(cohortId, { ...exportRequest.tables[exportTableIndex], fhir_filter: value })
      }

      handleTransferRequestChange(_transferRequest)
    } catch (error) {
      console.error('Erreur lors du fetch du count de la ressource', error)
      setError(Error.ERROR_FETCH)
    } finally {
      setCountLoading(false)
    }
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
      {!resourcesWithNoFilters.includes(exportTable.resourceType) && (
        <Grid item container alignItems="center" justifyContent="space-between">
          <Grid item xs={5}>
            <Typography className={classes.textBody2}>Filtrer cette table avec un filtre :</Typography>
          </Grid>
          <Grid item xs={6}>
            <Autocomplete
              className={classes.autocomplete}
              size="small"
              disabled={meState?.maintenance?.active || !exportTable.checked}
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
      )}
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
      {exportTable.checked &&
        exportTable.count > (exportTable.resourceType === ResourceType.DOCUMENTS ? 5000 : EXPORT_LINES_LIMIT) && (
          <Typography color={'red'} fontWeight={'bold'} fontSize={12}>
            La table sélectionnée dépasse la limite de{' '}
            {exportTable.resourceType === ResourceType.DOCUMENTS ? 5000 : EXPORT_LINES_LIMIT} lignes autorisées.
            Veuillez affiner votre sélection à l'aide de filtres ou désélectionner la table.
          </Typography>
        )}
    </Grid>
  )
}
