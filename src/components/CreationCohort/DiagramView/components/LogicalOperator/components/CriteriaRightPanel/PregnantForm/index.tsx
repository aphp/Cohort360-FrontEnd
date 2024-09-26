import React, { useEffect, useState } from 'react'

import { Autocomplete, TextField } from '@mui/material'

import useStyles from './styles'

import { CriteriaDrawerComponentProps, ScopeElement } from 'types'
import { LabelObject } from 'types/searchCriterias'
import {
  Comparators,
  CriteriaDataKey,
  PregnancyDataType,
  CriteriaType,
  CriteriaTypeLabels
} from 'types/requestCriterias'
import { BlockWrapper } from 'components/ui/Layout'
import OccurenceInput from 'components/ui/Inputs/Occurences'
import Collapse from 'components/ui/Collapse'
import SearchbarWithCheck from 'components/ui/Inputs/SearchbarWithCheck'
import CalendarRange from 'components/ui/Inputs/CalendarRange'
import { mappingCriteria } from '../DemographicForm'
import CriteriaLayout from 'components/ui/CriteriaLayout'
import { SourceType } from 'types/scope'
import { Hierarchy } from 'types/hierarchy'
import { CriteriaLabel } from 'components/ui/CriteriaLabel'
import ExecutiveUnitsInput from 'components/ui/Inputs/ExecutiveUnit'

enum Error {
  EMPTY_FORM,
  EMPTY_DURATION_ERROR,
  INCOHERENT_AGE_ERROR,
  SEARCHINPUT_ERROR,
  NO_ERROR
}

const PregnantForm = ({
  criteriaData,
  selectedCriteria,
  goBack,
  onChangeSelectedCriteria
}: CriteriaDrawerComponentProps) => {
  const criteria = selectedCriteria as PregnancyDataType
  const [title, setTitle] = useState(criteria?.title || 'Critère de Fiche de Grossesse')
  const [pregnancyStartDate, setPregnancyStartDate] = useState<string | null | undefined>(
    criteria?.pregnancyStartDate || null
  )
  const [pregnancyEndDate, setPregnancyEndDate] = useState<string | null | undefined>(
    criteria?.pregnancyEndDate || null
  )
  const [pregnancyMode, setPregnancyMode] = useState<LabelObject[]>(
    mappingCriteria(criteria?.pregnancyMode, CriteriaDataKey.PREGNANCY_MODE, criteriaData) || []
  )
  const [foetus, setFoetus] = useState<number>(criteria?.foetus || 0)
  const [foetusComparator, setFoetusComparator] = useState<Comparators>(
    criteria?.foetusComparator || Comparators.GREATER_OR_EQUAL
  )
  const [parity, setParity] = useState<number>(criteria?.parity || 0)
  const [parityComparator, setParityComparator] = useState<Comparators>(
    criteria?.parityComparator || Comparators.GREATER_OR_EQUAL
  )
  const [maternalRisks, setMaternalRisks] = useState<LabelObject[]>(
    mappingCriteria(criteria?.maternalRisks, CriteriaDataKey.MATERNAL_RISKS, criteriaData) || []
  )
  const [maternalRisksPrecision, setMaternalRisksPrecision] = useState<string>(criteria?.maternalRisksPrecision || '')
  const [risksRelatedToObstetricHistory, setRisksRelatedToObstetricHistory] = useState<LabelObject[]>(
    mappingCriteria(
      criteria?.risksRelatedToObstetricHistory,
      CriteriaDataKey.RISKS_RELATED_TO_OBSTETRIC_HISTORY,
      criteriaData
    ) || []
  )
  const [risksRelatedToObstetricHistoryPrecision, setRisksRelatedToObstetricHistoryPrecision] = useState<string>(
    criteria?.risksRelatedToObstetricHistoryPrecision || ''
  )
  const [risksOrComplicationsOfPregnancy, setRisksOrComplicationsOfPregnancy] = useState<LabelObject[]>(
    mappingCriteria(
      criteria?.risksOrComplicationsOfPregnancy,
      CriteriaDataKey.RISKS_OR_COMPLICATIONS_OF_PREGNANCY,
      criteriaData
    ) || []
  )
  const [risksOrComplicationsOfPregnancyPrecision, setrisksOrComplicationsOfPregnancyPrecision] = useState<string>(
    criteria?.risksOrComplicationsOfPregnancyPrecision || ''
  )
  const [corticotherapie, setCorticotherapie] = useState<LabelObject[]>(
    mappingCriteria(criteria?.corticotherapie, CriteriaDataKey.CORTICOTHERAPIE, criteriaData) || []
  )
  const [prenatalDiagnosis, setPrenatalDiagnosis] = useState<LabelObject[]>(
    mappingCriteria(criteria?.prenatalDiagnosis, CriteriaDataKey.PRENATAL_DIAGNOSIS, criteriaData) || []
  )
  const [ultrasoundMonitoring, setUltrasoundMonitoring] = useState<LabelObject[]>(
    mappingCriteria(criteria?.ultrasoundMonitoring, CriteriaDataKey.ULTRASOUND_MONITORING, criteriaData) || []
  )
  const [encounterService, setEncounterService] = useState<Hierarchy<ScopeElement, string>[]>(
    criteria?.encounterService || []
  )
  const [occurrence, setOccurrence] = useState<number>(criteria?.occurrence || 1)
  const [occurrenceComparator, setOccurrenceComparator] = useState<Comparators>(
    criteria?.occurrenceComparator || Comparators.GREATER_OR_EQUAL
  )
  const [encounterStatus, setEncounterStatus] = useState<LabelObject[]>(
    mappingCriteria(criteria?.encounterStatus, CriteriaDataKey.ENCOUNTER_STATUS, criteriaData) || []
  )
  const [isInclusive, setIsInclusive] = useState<boolean>(criteria?.isInclusive || true)

  const { classes } = useStyles()
  const isEdition = selectedCriteria !== null ? true : false
  const [error, setError] = useState(Error.NO_ERROR)

  useEffect(() => {
    setError(Error.NO_ERROR)
    if (
      (occurrence === 0 && occurrenceComparator === Comparators.EQUAL) ||
      (occurrence === 1 && occurrenceComparator === Comparators.LESS) ||
      (occurrence === 0 && occurrenceComparator === Comparators.LESS_OR_EQUAL)
    ) {
      setError(Error.EMPTY_FORM)
    }
  }, [occurrence, occurrenceComparator])

  const onSubmit = () => {
    onChangeSelectedCriteria({
      type: CriteriaType.PREGNANCY,
      id: criteria?.id,
      pregnancyStartDate,
      pregnancyEndDate,
      pregnancyMode,
      foetus,
      foetusComparator,
      parity,
      parityComparator,
      maternalRisks,
      maternalRisksPrecision,
      risksRelatedToObstetricHistory,
      risksRelatedToObstetricHistoryPrecision,
      risksOrComplicationsOfPregnancy,
      risksOrComplicationsOfPregnancyPrecision,
      corticotherapie,
      prenatalDiagnosis,
      ultrasoundMonitoring,
      encounterService,
      occurrence,
      occurrenceComparator,
      startOccurrence: [null, null],
      encounterStatus,
      isInclusive,
      title
    })
  }
  return (
    <CriteriaLayout
      criteriaLabel={`de ${CriteriaTypeLabels.PREGNANCY}`}
      title={title}
      onChangeTitle={setTitle}
      isEdition={isEdition}
      goBack={goBack}
      onSubmit={onSubmit}
      disabled={error === Error.INCOHERENT_AGE_ERROR || error === Error.EMPTY_FORM}
      isInclusive={isInclusive}
      onChangeIsInclusive={setIsInclusive}
      infoAlert={['Tous les éléments des champs multiples sont liés par une contrainte OU']}
      errorAlert={[
        error === Error.EMPTY_FORM ? "Merci de renseigner au moins un nombre d'occurrence supérieur ou égal à 1" : ''
      ]}
    >
      <BlockWrapper className={classes.inputItem}>
        <OccurenceInput
          value={occurrence}
          comparator={occurrenceComparator}
          onchange={(newOccurence, newComparator) => {
            setOccurrence(newOccurence)
            setOccurrenceComparator(newComparator)
          }}
        />
      </BlockWrapper>
      <BlockWrapper style={{ margin: '0 1em 1em' }}>
        <ExecutiveUnitsInput
          sourceType={SourceType.MATERNITY}
          value={encounterService}
          onChange={setEncounterService}
        />
      </BlockWrapper>
      <BlockWrapper style={{ margin: '0 1em 1em' }}>
        <Autocomplete
          multiple
          options={criteriaData.data.encounterStatus || []}
          noOptionsText="Veuillez entrer un statut de visite associée"
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={encounterStatus}
          onChange={(e, value) => setEncounterStatus(value)}
          renderInput={(params) => <TextField {...params} label="Statut de la visite associée" />}
        />
      </BlockWrapper>

      <BlockWrapper className={classes.inputItem}>
        <Collapse title="Renseignement de grossesse" margin="0">
          <BlockWrapper style={{ margin: '0 2em 1em 0' }}>
            <CriteriaLabel label="Date de début de grossesse" style={{ paddingBottom: 0 }} />
            <CalendarRange
              inline
              value={[pregnancyStartDate, pregnancyEndDate]}
              onChange={([start, end]) => {
                setPregnancyStartDate(start)
                setPregnancyEndDate(end)
              }}
              onError={(isError) => setError(isError ? Error.INCOHERENT_AGE_ERROR : Error.NO_ERROR)}
            />
          </BlockWrapper>

          <Autocomplete
            multiple
            id="pregnancy-mode-autocomplete"
            options={criteriaData.data.pregnancyMode || []}
            noOptionsText="Veuillez entrer un mode d'obtention de la grossesse"
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={pregnancyMode}
            onChange={(e, value) => setPregnancyMode(value)}
            renderInput={(params) => <TextField {...params} label="Mode d'obtention de la grossesse" />}
            style={{ marginBottom: '1em' }}
          />

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <OccurenceInput
              label="Nombre de fœtus"
              value={foetus}
              comparator={foetusComparator}
              onchange={(newFoetus, newComparator) => {
                setFoetus(newFoetus)
                setFoetusComparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <OccurenceInput
              label="Parité"
              value={parity}
              comparator={parityComparator}
              onchange={(newParity, newComparator) => {
                setParity(newParity)
                setParityComparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper>
            <CriteriaLabel label="Risques" />

            <Autocomplete
              multiple
              id="maternal-risks-autocomplete"
              options={criteriaData.data.maternalRisks || []}
              noOptionsText="Veuillez entrer un risque lié aux antécédents maternels"
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={maternalRisks}
              onChange={(e, value) => setMaternalRisks(value)}
              renderInput={(params) => <TextField {...params} label="Risques liés aux antécédents maternels" />}
              style={{ marginBottom: '1em' }}
            />

            <BlockWrapper style={{ marginBottom: '1em' }}>
              <SearchbarWithCheck
                searchInput={maternalRisksPrecision}
                setSearchInput={setMaternalRisksPrecision}
                placeholder="Risques liés aux antécédents maternels - Précision autre"
                onError={(isError) => setError(isError ? Error.SEARCHINPUT_ERROR : Error.NO_ERROR)}
              />
            </BlockWrapper>

            <Autocomplete
              multiple
              id="risks-related-to-obstetric-history-autocomplete"
              options={criteriaData.data.risksRelatedToObstetricHistory || []}
              noOptionsText="Veuillez entrer un risque lié aux antécédents obstétricaux"
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={risksRelatedToObstetricHistory}
              onChange={(e, value) => setRisksRelatedToObstetricHistory(value)}
              renderInput={(params) => <TextField {...params} label="Risques liés aux antécédents obstétricaux" />}
              style={{ marginBottom: '1em' }}
            />

            <SearchbarWithCheck
              searchInput={risksRelatedToObstetricHistoryPrecision}
              setSearchInput={setRisksRelatedToObstetricHistoryPrecision}
              placeholder="Risques liés aux antécédents obstétricaux - précision autre"
              onError={(isError) => setError(isError ? Error.SEARCHINPUT_ERROR : Error.NO_ERROR)}
            />
          </BlockWrapper>
        </Collapse>
      </BlockWrapper>

      <BlockWrapper className={classes.inputItem}>
        <Collapse title="Suivi de grossesse" margin="0">
          <CriteriaLabel label="Suivi échographique" />
          <Autocomplete
            multiple
            id="ultrasound-monitoring-autocomplete"
            options={criteriaData.data.prenatalDiagnosis || []}
            noOptionsText='Veuillez entrer "oui" ou "non"'
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={ultrasoundMonitoring}
            onChange={(e, value) => setUltrasoundMonitoring(value)}
            renderInput={(params) => <TextField {...params} label="Suivi échographique" />}
            style={{ marginBottom: '1em' }}
          />

          <CriteriaLabel label="Corticothérapie pour maturation pulmonaire fœtale" />
          <Autocomplete
            multiple
            id="corticotherapie-autocomplete"
            options={criteriaData.data.prenatalDiagnosis || []}
            noOptionsText='Veuillez entrer "oui" ou "non"'
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={corticotherapie}
            onChange={(e, value) => setCorticotherapie(value)}
            renderInput={(params) => (
              <TextField {...params} label="Corticothérapie pour maturation pulmonaire fœtale" />
            )}
            style={{ marginBottom: '1em' }}
          />

          <CriteriaLabel label="Risques" />
          <Autocomplete
            multiple
            id="risks-or-complications-of-pregnancy-autocomplete"
            options={criteriaData.data.risksOrComplicationsOfPregnancy || []}
            noOptionsText="Veuillez entrer un risque ou complication de la grossesse"
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={risksOrComplicationsOfPregnancy}
            onChange={(e, value) => setRisksOrComplicationsOfPregnancy(value)}
            renderInput={(params) => <TextField {...params} label="Risques ou complications de la grossesse" />}
            style={{ marginBottom: '1em' }}
          />

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <SearchbarWithCheck
              searchInput={risksOrComplicationsOfPregnancyPrecision}
              setSearchInput={setrisksOrComplicationsOfPregnancyPrecision}
              placeholder="Risques ou complications de la grossesse - Précision autre"
              onError={(isError) => setError(isError ? Error.SEARCHINPUT_ERROR : Error.NO_ERROR)}
            />
          </BlockWrapper>

          <BlockWrapper className={classes.inputItem}>
            <CriteriaLabel label="Grossesse suivie au diagnostic prénatal" />

            <Autocomplete
              multiple
              id="prenatal-diagnosis-autocomplete"
              options={criteriaData.data.prenatalDiagnosis || []}
              noOptionsText='Veuillez entrer "oui" ou "non"'
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={prenatalDiagnosis}
              onChange={(e, value) => setPrenatalDiagnosis(value)}
              renderInput={(params) => <TextField {...params} label="Grossesse suivie au diagnostic prénatal" />}
            />
          </BlockWrapper>
        </Collapse>
      </BlockWrapper>
    </CriteriaLayout>
  )
}

export default PregnantForm
