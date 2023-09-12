import React, { useEffect, useState } from 'react'

import {
  Autocomplete,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'

import { DateWrapper, FormWrapper, InputWrapper } from '../ui/Inputs/styles'
import { InputAgeRange } from '../Inputs'
import { GenderStatus, VitalStatus, GenderStatusLabel, Filters } from 'types/searchCriterias'
import { isChecked, toggleFilter } from 'utils/filters'
import { capitalizeFirstLetter } from 'utils/capitalize'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import PopulationCard from 'components/CreationCohort/DiagramView/components/PopulationCard/PopulationCard'
import ClearIcon from '@mui/icons-material/Clear'
import InfoIcon from '@mui/icons-material/Info'
import scopeType from 'data/scope_type.json'
import { CriteriaName, CriteriaNameType, SimpleCodeType } from 'types'
import moment from 'moment'

export type FiltersModalProps = {
  data?: Filters
  allDiagnosticTypesList?: string[]
  allPrescriptionList?: string[]
  allAdministrationList?: string[]
  allDocTypesList?: SimpleCodeType[]
  criteriaName?: CriteriaNameType
  deidentified?: boolean
  onChange?: (newFilters: Filters) => void
}

/* - rajouter le deindentified 
    - rajouter le showDiagnosticTypes
    - rajouter les erreurs de date */
const FiltersModal = ({
  data,
  allDiagnosticTypesList,
  allAdministrationList,
  allPrescriptionList,
  allDocTypesList,
  criteriaName,
  deidentified,
  onChange
}: FiltersModalProps) => {
  const [genders, setGenders] = useState(data?.genders)
  const [vitalStatuses, setVitalStatuses] = useState(data?.vitalStatuses)
  const [birthdatesRanges, setBirthdatesRanges] = useState(data?.birthdatesRanges)
  const [validatedStatus] = useState(data?.validatedStatus)
  const [nda, setNda] = useState(data?.nda)
  const [loinc, setLoinc] = useState(data?.loinc)
  const [anabio, setAnabio] = useState(data?.anabio)
  const [code, setCode] = useState(data?.code)
  const [startDate, setStartDate] = useState(data?.startDate)
  const [endDate, setEndDate] = useState(data?.endDate)
  const [docTypes, setDocTypes] = useState(data?.docTypes)
  const [diagnosticTypes, setDiagnosticTypes] = useState(data?.diagnosticTypes)
  const [prescriptionTypes, setPrescriptionTypes] = useState(data?.prescriptionTypes)
  const [administrationRoutes, setAdministrationRoutes] = useState(data?.administrationRoutes)
  const [executiveUnits, setExecutiveUnits] = useState(data?.executiveUnits)

  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (onChange) {
      onChange({
        genders,
        vitalStatuses,
        birthdatesRanges,
        nda,
        loinc,
        anabio,
        code,
        startDate,
        endDate,
        diagnosticTypes,
        prescriptionTypes,
        administrationRoutes,
        docTypes,
        executiveUnits,
        validatedStatus
      })
    }
  }, [
    genders,
    vitalStatuses,
    birthdatesRanges,
    nda,
    loinc,
    anabio,
    code,
    startDate,
    endDate,
    diagnosticTypes,
    prescriptionTypes,
    administrationRoutes,
    docTypes,
    executiveUnits,
    validatedStatus
  ])

  const _onError = (isError: boolean, errorMessage = '') => {
    setError(isError)
    setErrorMessage(errorMessage)
  }
  return (
    <FormWrapper>
      {genders && (
        <InputWrapper>
          <Typography variant="h3">Genre :</Typography>
          <FormGroup
            onChange={(e) => setGenders(toggleFilter(genders, (e.target as HTMLInputElement).value) as GenderStatus[])}
            row={true}
          >
            <FormControlLabel
              checked={isChecked(GenderStatus.FEMALE, genders)}
              value={GenderStatus.FEMALE}
              control={<Checkbox color="secondary" />}
              label={GenderStatusLabel.FEMALE}
            />
            <FormControlLabel
              checked={isChecked(GenderStatus.MALE, genders)}
              value={GenderStatus.MALE}
              control={<Checkbox color="secondary" />}
              label={GenderStatusLabel.MALE}
            />
            <FormControlLabel
              checked={isChecked(GenderStatus.OTHER_UNKNOWN, genders)}
              value={GenderStatus.OTHER_UNKNOWN}
              control={<Checkbox color="secondary" />}
              label={GenderStatusLabel.OTHER_UNKNOWN}
            />
          </FormGroup>
        </InputWrapper>
      )}
      {birthdatesRanges && (
        <InputWrapper>
          <InputAgeRange
            error={{ isError: error, errorMessage: errorMessage }}
            onError={_onError}
            birthdatesRanges={birthdatesRanges}
            onChangeBirthdatesRanges={(newBirthdatesRanges: [string, string]) =>
              setBirthdatesRanges(newBirthdatesRanges)
            }
          />
        </InputWrapper>
      )}

      {vitalStatuses && (
        <InputWrapper>
          <Typography variant="h3">Statut vital :</Typography>
          <FormGroup
            onChange={(e) =>
              setVitalStatuses(toggleFilter(vitalStatuses, (e.target as HTMLInputElement).value) as VitalStatus[])
            }
            row={true}
          >
            <FormControlLabel
              checked={isChecked(VitalStatus.ALIVE, vitalStatuses)}
              value={VitalStatus.ALIVE}
              control={<Checkbox color="secondary" />}
              label="Patients vivants"
            />
            <FormControlLabel
              checked={isChecked(VitalStatus.DECEASED, vitalStatuses)}
              value={VitalStatus.DECEASED}
              control={<Checkbox color="secondary" />}
              label="Patients décédés"
            />
          </FormGroup>
        </InputWrapper>
      )}

      {nda !== undefined && !deidentified && (
        <InputWrapper>
          <Typography variant="h3">NDA :</Typography>
          <TextField
            fullWidth
            autoFocus
            placeholder="Exemple: 6601289264,141740347"
            value={nda}
            onChange={(event) => setNda(event.target.value)}
          />
        </InputWrapper>
      )}

      {code !== undefined && (
        <InputWrapper>
          <Typography variant="h3">Code :</Typography>
          <TextField
            fullWidth
            autoFocus
            placeholder="Exemple: G629,R2630,F310"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </InputWrapper>
      )}
      {anabio !== undefined && (
        <InputWrapper>
          <Typography variant="h3">Code ANABIO :</Typography>
          <TextField
            margin="normal"
            fullWidth
            autoFocus
            placeholder="Exemple: A0260,E2068"
            value={anabio}
            onChange={(event) => setAnabio(event.target.value)}
          />
        </InputWrapper>
      )}

      {loinc !== undefined && (
        <InputWrapper>
          <Typography variant="h3">Code LOINC :</Typography>
          <TextField
            margin="normal"
            fullWidth
            autoFocus
            placeholder="Exemple: A0260,E2068"
            value={loinc}
            onChange={(event) => setLoinc(event.target.value)}
          />
        </InputWrapper>
      )}
      {allDocTypesList && allDocTypesList.length > 0 && docTypes && (
        <InputWrapper>
          <Typography variant="h3">Type de documents :</Typography>
          <Autocomplete
            multiple
            onChange={(event, value) => {
              setDocTypes(value)
            }}
            groupBy={(doctype) => doctype.type}
            options={allDocTypesList}
            value={docTypes}
            disableCloseOnSelect
            getOptionLabel={(docType: any) => docType.label}
            renderGroup={(docType: any) => {
              const currentDocTypeList = allDocTypesList
                ? allDocTypesList.filter((doc: any) => doc.type === docType.group)
                : []
              const currentSelectedDocTypeList = docTypes
                ? docTypes.filter((doc: any) => doc.type === docType.group)
                : []

              const onClick = () => {
                if (currentDocTypeList.length === currentSelectedDocTypeList.length) {
                  setDocTypes(docTypes.filter((doc: any) => doc.type !== docType.group))
                } else {
                  setDocTypes(
                    [...docTypes, ...currentDocTypeList].filter((item, index, array) => array.indexOf(item) === index)
                  )
                }
              }

              return (
                <React.Fragment>
                  <Grid container direction="row" alignItems="center">
                    <Checkbox
                      indeterminate={
                        currentDocTypeList.length !== currentSelectedDocTypeList.length &&
                        currentSelectedDocTypeList.length > 0
                      }
                      checked={currentDocTypeList.length === currentSelectedDocTypeList.length}
                      onClick={onClick}
                    />
                    <Typography onClick={onClick} noWrap style={{ cursor: 'pointer', width: 'calc(100% - 150px' }}>
                      {docType.group}
                    </Typography>
                  </Grid>
                  {docType.children}
                </React.Fragment>
              )
            }}
            renderOption={(props, docType: any) => <li {...props}>{docType.label}</li>}
            renderInput={(params) => <TextField {...params} placeholder="Types de documents" />}
          />
        </InputWrapper>
      )}

      {allDiagnosticTypesList && allDiagnosticTypesList.length > 0 && criteriaName === CriteriaName.Cim10 && (
        <InputWrapper>
          <Typography variant="h3">Type de diagnostics :</Typography>
          <Autocomplete
            multiple
            onChange={(event, value) => {
              setDiagnosticTypes(value)
            }}
            options={allDiagnosticTypesList}
            value={diagnosticTypes}
            disableCloseOnSelect
            getOptionLabel={(diagnosticType: any) => capitalizeFirstLetter(diagnosticType.label)}
            renderOption={(props, diagnosticType: any) => (
              <li {...props}>{capitalizeFirstLetter(diagnosticType.label)}</li>
            )}
            renderInput={(params) => (
              <TextField {...params} label="Types de diagnostics" placeholder="Sélectionner type(s) de diagnostics" />
            )}
          />
        </InputWrapper>
      )}

      {allAdministrationList && allAdministrationList.length > 0 && (
        <InputWrapper>
          <Typography variant="h3">Voie d'administration :</Typography>
          <Autocomplete
            multiple
            onChange={(event, value) => {
              setAdministrationRoutes(value)
            }}
            options={allAdministrationList}
            value={administrationRoutes}
            disableCloseOnSelect
            getOptionLabel={(administrationRoute: any) => capitalizeFirstLetter(administrationRoute.label)}
            renderOption={(props, administrationRoute: any) => (
              <li {...props}>{capitalizeFirstLetter(administrationRoute.label)}</li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Voie d'administration"
                placeholder="Sélectionner une ou plusieurs voie d'administration"
              />
            )}
          />
        </InputWrapper>
      )}

      {allPrescriptionList && allPrescriptionList.length > 0 && (
        <InputWrapper>
          <Typography variant="h3">Type de prescriptions :</Typography>
          <Autocomplete
            multiple
            onChange={(event, value) => {
              setPrescriptionTypes(value)
            }}
            options={allPrescriptionList}
            value={prescriptionTypes}
            disableCloseOnSelect
            getOptionLabel={(prescriptionType: any) => capitalizeFirstLetter(prescriptionType.label)}
            renderOption={(props, prescriptionType: any) => (
              <li {...props}>{capitalizeFirstLetter(prescriptionType.label)}</li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Types de prescriptions"
                placeholder="Sélectionner type(s) de prescriptions"
              />
            )}
          />
        </InputWrapper>
      )}

      {startDate !== undefined && endDate !== undefined && (
        <>
          <Typography variant="h3">Date :</Typography>
          <InputWrapper>
            <DateWrapper>
              <FormLabel component="legend">Après le :</FormLabel>
              <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={'fr'}>
                <DatePicker
                  onChange={(date) => setStartDate(moment(date).isValid() ? moment(date).format('YYYY-MM-DD') : null)}
                  value={startDate}
                  renderInput={(params: any) => <TextField {...params} variant="standard" />}
                />
              </LocalizationProvider>
              {startDate !== null && (
                <IconButton size="small" color="primary" onClick={() => setStartDate(null)}>
                  <ClearIcon />
                </IconButton>
              )}
            </DateWrapper>
          </InputWrapper>

          <InputWrapper>
            <DateWrapper>
              <FormLabel component="legend">Avant le :</FormLabel>
              <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={'fr'}>
                <DatePicker
                  onChange={(date) => setEndDate(moment(date).isValid() ? moment(date).format('YYYY-MM-DD') : null)}
                  value={endDate}
                  renderInput={(params: any) => <TextField {...params} variant="standard" />}
                />
              </LocalizationProvider>
              {endDate !== null && (
                <IconButton color="primary" onClick={() => setEndDate(null)}>
                  <ClearIcon />
                </IconButton>
              )}
            </DateWrapper>
          </InputWrapper>
        </>
      )}

      {executiveUnits !== undefined && criteriaName !== undefined && (
        <InputWrapper>
          <Grid container alignContent="center">
            <Typography variant="h3" alignSelf="center">
              {' '}
              Unité exécutrice :
            </Typography>
            <Tooltip
              title={
                <>
                  {(('- Le niveau hiérarchique de rattachement est : ' +
                    scopeType?.criteriaType[criteriaName]) as string) + '.'}
                  <br />
                  {"- L'unité exécutrice" +
                    ' est la structure élémentaire de prise en charge des malades par une équipe soignante ou médico-technique identifiées par leurs fonctions et leur organisation.'}
                </>
              }
            >
              <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
            </Tooltip>
          </Grid>

          <Grid item container direction="row" alignItems="center">
            <PopulationCard
              form={criteriaName}
              label="Sélectionner une unité exécutrice"
              title="Sélectionner une unité exécutrice"
              executiveUnits={executiveUnits}
              isAcceptEmptySelection={true}
              isDeleteIcon={true}
              onChangeExecutiveUnits={setExecutiveUnits}
            />
          </Grid>
        </InputWrapper>
      )}
    </FormWrapper>
  )
}

export default FiltersModal
