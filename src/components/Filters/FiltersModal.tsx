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

import { DateWrapper, FormWrapper, InputWrapper } from './styles'
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
import { CriteriaNameType } from 'types'
import moment from 'moment'

export type FiltersModalProps = {
  data?: Filters
  allDiagnosticTypesList?: string[]
  pmsiType?: CriteriaNameType
  onChange?: (newFilters: Filters) => void
}

/* - rajouter le deindentified 
    - rajouter le showDiagnosticTypes
    - rajouter les erreurs de date */
const FiltersModal = ({ data, allDiagnosticTypesList, pmsiType, onChange }: FiltersModalProps) => {
  const [genders, setGenders] = useState(data?.genders)
  const [vitalStatuses, setVitalStatuses] = useState(data?.vitalStatuses)
  const [birthdatesRanges, setBirthdatesRanges] = useState(data?.birthdatesRanges)
  const [nda, setNda] = useState(data?.nda)
  const [loinc, setLoinc] = useState(data?.loinc)
  const [anabio, setAnabio] = useState(data?.anabio)
  const [code, setCode] = useState(data?.code)
  const [startDate, setStartDate] = useState(data?.startDate)
  const [endDate, setEndDate] = useState(data?.endDate)
  const [diagnosticTypes, setDiagnosticTypes] = useState(data?.diagnosticTypes)
  const [selectedPrescriptionTypes, setSelectedPrescriptionTypes] = useState(data?.selectedPrescriptionTypes)
  const [selectedAdministrationRoutes, setSelectedAdministrationRoutes] = useState(data?.selectedAdministrationRoutes)
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
        selectedPrescriptionTypes,
        selectedAdministrationRoutes,
        executiveUnits
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
    selectedPrescriptionTypes,
    selectedAdministrationRoutes,
    executiveUnits
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

      {nda !== undefined && (
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
      {diagnosticTypes !== undefined && allDiagnosticTypesList && allDiagnosticTypesList.length > 0 && (
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

      {executiveUnits !== undefined && pmsiType !== undefined && (
        <InputWrapper>
          <Grid container alignContent="center">
            <Typography variant="h3" alignSelf="center">
              {' '}
              Unité exécutrice :
            </Typography>
            <Tooltip
              title={
                <>
                  {(('- Le niveau hiérarchique de rattachement est : ' + scopeType?.criteriaType[pmsiType]) as string) +
                    '.'}
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
              form={pmsiType}
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
