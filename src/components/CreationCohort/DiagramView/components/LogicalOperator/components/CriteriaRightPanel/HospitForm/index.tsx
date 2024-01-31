import React, { useEffect, useState } from 'react'

import { Autocomplete, FormLabel, TextField, Typography } from '@mui/material'

import useStyles from './styles'

import { CriteriaDrawerComponentProps, CriteriaName, ScopeTreeRow } from 'types'
import PopulationCard from '../../../../PopulationCard/PopulationCard'
import { STRUCTURE_HOSPITALIERE_DE_PRIS_EN_CHARGE } from 'utils/cohortCreation'
import { LabelObject } from 'types/searchCriterias'
import {
  Comparators,
  CriteriaDataKey,
  HospitDataType,
  RessourceType,
  RessourceTypeLabels
} from 'types/requestCriterias'
import { BlockWrapper } from 'components/ui/Layout'
import OccurenceInput from 'components/ui/Inputs/Occurences'
import Collapse from 'components/ui/Collapse'
import SearchbarWithCheck from 'components/ui/Inputs/SearchbarWithCheck'
import { mappingCriteria } from '../DemographicForm'
import { booleanFieldsData } from 'data/fake_mater_data'
import CriteriaLayout from 'components/ui/CriteriaLayout'

enum Error {
  EMPTY_FORM,
  EMPTY_DURATION_ERROR,
  INCOHERENT_AGE_ERROR,
  SEARCHINPUT_ERROR,
  NO_ERROR
}

const HospitForm = ({
  criteriaData,
  selectedCriteria,
  goBack,
  onChangeSelectedCriteria
}: CriteriaDrawerComponentProps) => {
  const criteria = selectedCriteria as HospitDataType
  const [title, setTitle] = useState(criteria?.title || "Critère de Fiche d'hospitalisation")
  const [hospitReason, setHospitReason] = useState<string>(criteria?.hospitReason || '')
  const [inUteroTransfer, setInUteroTransfer] = useState<LabelObject[]>(
    mappingCriteria(criteria?.inUteroTransfer, CriteriaDataKey.IN_UTERO_TRANSFER, criteriaData) || []
  )
  const [pregnancyMonitoring, setPregnancyMonitoring] = useState<LabelObject[]>(
    mappingCriteria(criteria?.pregnancyMonitoring, CriteriaDataKey.PREGNANCY_MONITORING, criteriaData) || []
  )
  const [vme, setVme] = useState<LabelObject[]>(mappingCriteria(criteria?.vme, CriteriaDataKey.VME, criteriaData) || [])
  const [maturationCorticotherapie, setMaturationCorticotherapie] = useState<LabelObject[]>(
    mappingCriteria(criteria?.maturationCorticotherapie, CriteriaDataKey.MATURATION_CORTICOTHERAPIE, criteriaData) || []
  )
  const [chirurgicalGesture, setChirurgicalGesture] = useState<LabelObject[]>(
    mappingCriteria(criteria?.chirurgicalGesture, CriteriaDataKey.CHIRURGICAL_GESTURE, criteriaData) || []
  )
  const [childbirth, setChildbirth] = useState<LabelObject[]>(
    mappingCriteria(criteria?.childbirth, CriteriaDataKey.CHILDBIRTH, criteriaData) || []
  )
  const [childbirthPlace, setChildbirthPlace] = useState<LabelObject[]>(
    mappingCriteria(criteria?.childbirthPlace, CriteriaDataKey.CHILDBIRTH_PLACE, criteriaData) || []
  )
  const [childbirthMode, setChildbirthMode] = useState<LabelObject[]>(
    mappingCriteria(criteria?.childbirthMode, CriteriaDataKey.CHILDBIRTH_MODE, criteriaData) || []
  )
  const [maturationReason, setMaturationReason] = useState<LabelObject[]>(
    mappingCriteria(criteria?.maturationReason, CriteriaDataKey.MATURATION_REASON, criteriaData) || []
  )
  const [maturationModality, setMaturationModality] = useState<LabelObject[]>(
    mappingCriteria(criteria?.maturationModality, CriteriaDataKey.MATURATION_MODALITY, criteriaData) || []
  )
  const [imgIndication, setImgIndication] = useState<LabelObject[]>(
    mappingCriteria(criteria?.imgIndication, CriteriaDataKey.IMG_INDICATION, criteriaData) || []
  )
  const [laborOrCesareanEntry, setLaborOrCesareanEntry] = useState<LabelObject[]>(
    mappingCriteria(criteria?.laborOrCesareanEntry, CriteriaDataKey.LABOR_OR_CESAREAN_ENTRY, criteriaData) || []
  )
  const [pathologyDuringLabor, setPathologyDuringLabor] = useState<LabelObject[]>(
    mappingCriteria(criteria?.pathologyDuringLabor, CriteriaDataKey.PATHOLOGY_DURING_LABOR, criteriaData) || []
  )
  const [obstetricalGestureDuringLabor, setObstetricalGestureDuringLabor] = useState<LabelObject[]>(
    mappingCriteria(
      criteria?.obstetricalGestureDuringLabor,
      CriteriaDataKey.OBSTETRICAL_GESTURE_DURING_LABOR,
      criteriaData
    ) || []
  )
  const [analgesieType, setAnalgesieType] = useState<LabelObject[]>(
    mappingCriteria(criteria?.analgesieType, CriteriaDataKey.ANALGESIE_TYPE, criteriaData) || []
  )
  const [feedingType, setFeedingType] = useState<LabelObject[]>(
    mappingCriteria(criteria?.feedingType, CriteriaDataKey.FEEDING_TYPE, criteriaData) || []
  )
  const [complication, setComplication] = useState<LabelObject[]>(
    mappingCriteria(criteria?.complication, CriteriaDataKey.COMPLICATION, criteriaData) || []
  )
  const [exitFeedingMode, setExitFeedingMode] = useState<LabelObject[]>(
    mappingCriteria(criteria?.exitFeedingMode, CriteriaDataKey.EXIT_FEEDING_MODE, criteriaData) || []
  )
  const [exitDiagnostic, setExitDiagnostic] = useState<LabelObject[]>(
    mappingCriteria(criteria?.exitDiagnostic, CriteriaDataKey.EXIT_DIAGNOSTIC, criteriaData) || []
  )
  const [encounterService, setEncounterService] = useState<ScopeTreeRow[]>(criteria?.encounterService || [])
  const [occurrence, setOccurrence] = useState<number>(criteria?.occurrence || 1)
  const [occurrenceComparator, setOccurrenceComparator] = useState<Comparators>(
    criteria?.occurrenceComparator || Comparators.GREATER_OR_EQUAL
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
      type: RessourceType.HOSPIT,
      id: criteria?.id,
      hospitReason,
      inUteroTransfer,
      pregnancyMonitoring,
      vme,
      maturationCorticotherapie,
      chirurgicalGesture,
      childbirth,
      childbirthPlace,
      childbirthMode,
      maturationReason,
      maturationModality,
      imgIndication,
      laborOrCesareanEntry,
      pathologyDuringLabor,
      obstetricalGestureDuringLabor,
      analgesieType,
      feedingType,
      complication,
      exitFeedingMode,
      exitDiagnostic,
      encounterService,
      occurrence,
      occurrenceComparator,
      encounterStartDate: null,
      encounterEndDate: null,
      isInclusive,
      title
    })
  }
  return (
    <CriteriaLayout
      criteriaLabel={`de ${RessourceTypeLabels.HOSPIT}`}
      title={title}
      onChangeTitle={setTitle}
      isEdition={isEdition}
      goBack={goBack}
      onSubmit={onSubmit}
      disabled={error === Error.INCOHERENT_AGE_ERROR || error === Error.EMPTY_FORM}
      isInclusive={isInclusive}
      onChangeIsInclusive={setIsInclusive}
      infoAlert="Tous les éléments des champs multiples sont liés par une contrainte OU"
      errorAlert={
        error === Error.EMPTY_FORM ? "Merci de renseigner au moins un nombre d'occurence supérieur ou égal à 1" : ''
      }
    >
      <BlockWrapper>
        <Typography variant="h6">Fiche de Grossesse</Typography>
      </BlockWrapper>

      <BlockWrapper className={classes.inputItem}>
        <FormLabel component="legend" className={classes.durationLegend}>
          <BlockWrapper container justifyItems="center">
            Nombre d'occurrences
          </BlockWrapper>
        </FormLabel>
        <OccurenceInput
          value={occurrence}
          comparator={occurrenceComparator}
          onchange={(newOccurence, newComparator) => {
            setOccurrence(newOccurence)
            setOccurrenceComparator(newComparator)
          }}
        />
      </BlockWrapper>
      <BlockWrapper className={classes.inputItem}>
        <PopulationCard
          form={CriteriaName.VisitSupport}
          label={STRUCTURE_HOSPITALIERE_DE_PRIS_EN_CHARGE}
          title={STRUCTURE_HOSPITALIERE_DE_PRIS_EN_CHARGE}
          executiveUnits={encounterService || []}
          isAcceptEmptySelection={true}
          isDeleteIcon={true}
          onChangeExecutiveUnits={(newValue) => setEncounterService(newValue)}
        />
      </BlockWrapper>

      <BlockWrapper className={classes.inputItem}>
        <Collapse title="ADMISSION" value={false}>
          <BlockWrapper className={classes.inputItem}>
            <SearchbarWithCheck
              searchInput={hospitReason}
              setSearchInput={setHospitReason}
              placeholder="Motif(s) d'hospitalisation"
              onError={(isError) => setError(isError ? Error.SEARCHINPUT_ERROR : Error.NO_ERROR)}
            />
          </BlockWrapper>

          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Transfert in utero
            </FormLabel>
            <Autocomplete
              multiple
              id="in-utero-transfer-autocomplete"
              options={/*criteriaData.data.inuterotransfert ||*/ booleanFieldsData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={inUteroTransfer}
              onChange={(e, value) => setInUteroTransfer(value)}
              renderInput={(params) => <TextField {...params} label="Transfert in utero" />}
            />
          </BlockWrapper>

          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Grossesse peu ou pas suivie
            </FormLabel>
            <Autocomplete
              multiple
              id="pregnancy-monitoring-autocomplete"
              options={/*criteriaData.data.pregnancyMonitoring ||*/ booleanFieldsData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={pregnancyMonitoring}
              onChange={(e, value) => setPregnancyMonitoring(value)}
              renderInput={(params) => <TextField {...params} label="Grossesse peu ou pas suivie" />}
            />
          </BlockWrapper>

          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              VME
            </FormLabel>
            <Autocomplete
              multiple
              id="vme-autocomplete"
              options={/*criteriaData.data.vme ||*/ booleanFieldsData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={vme}
              onChange={(e, value) => setVme(value)}
              renderInput={(params) => <TextField {...params} label="VME" />}
            />
          </BlockWrapper>

          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Corticothérapie pour maturation foetal faite
            </FormLabel>
            <Autocomplete
              multiple
              id="maturation-corticotherapie-autocomplete"
              options={/*criteriaData.data.maturationCorticotherapie ||*/ booleanFieldsData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={maturationCorticotherapie}
              onChange={(e, value) => setMaturationCorticotherapie(value)}
              renderInput={(params) => <TextField {...params} label="Corticothérapie pour maturation foetal faite" />}
            />
          </BlockWrapper>

          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Type de geste ou de chirurgie
            </FormLabel>
            <Autocomplete
              multiple
              id="chirurgical-gesture-autocomplete"
              options={/*criteriaData.data.chirurgicalGesture ||*/ booleanFieldsData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={chirurgicalGesture}
              onChange={(e, value) => setChirurgicalGesture(value)}
              renderInput={(params) => <TextField {...params} label="Type de geste ou de chirurgie" />}
            />
          </BlockWrapper>
        </Collapse>
      </BlockWrapper>

      <BlockWrapper className={classes.inputItem}>
        <Collapse title="SYNTHESE" value={false}>
          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Accouchement
            </FormLabel>
            <Autocomplete
              multiple
              id="childbirth-autocomplete"
              options={/*criteriaData.data.childbirth ||*/ booleanFieldsData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={childbirth}
              onChange={(e, value) => setChildbirth(value)}
              renderInput={(params) => <TextField {...params} label="Accouchement" />}
            />
          </BlockWrapper>

          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Lieu d'accouchement
            </FormLabel>
            <Autocomplete
              multiple
              id="childbirth-place-autocomplete"
              options={/*criteriaData.data.childbirthPlace ||*/ booleanFieldsData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={childbirthPlace}
              onChange={(e, value) => setChildbirthPlace(value)}
              renderInput={(params) => <TextField {...params} label="Lieu d'accouchement" />}
            />
          </BlockWrapper>

          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Mode de mise en travail
            </FormLabel>
            <Autocomplete
              multiple
              id="childbirth-mode-autocomplete"
              options={/*criteriaData.data.childbirthMode ||*/ booleanFieldsData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={childbirthMode}
              onChange={(e, value) => setChildbirthMode(value)}
              renderInput={(params) => <TextField {...params} label="Mode de mise en travail" />}
            />
          </BlockWrapper>

          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Motif(s) de maturation / déclenchement
            </FormLabel>
            <Autocomplete
              multiple
              id="maturation-reason-autocomplete"
              options={/*criteriaData.data.maturationReason ||*/ booleanFieldsData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={maturationReason}
              onChange={(e, value) => setMaturationReason(value)}
              renderInput={(params) => <TextField {...params} label="Motif(s) de maturation / déclenchement" />}
            />
          </BlockWrapper>

          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Modalités de maturation cervicale initiale
            </FormLabel>
            <Autocomplete
              multiple
              id="maturation-modality-autocomplete"
              options={/*criteriaData.data.maturationModality ||*/ booleanFieldsData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={maturationModality}
              onChange={(e, value) => setMaturationModality(value)}
              renderInput={(params) => <TextField {...params} label="Modalités de maturation cervicale initiale" />}
            />
          </BlockWrapper>

          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Indication de l'IMG
            </FormLabel>
            <Autocomplete
              multiple
              id="img-indication-autocomplete"
              options={/*criteriaData.data.imgIndication ||*/ booleanFieldsData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={imgIndication}
              onChange={(e, value) => setImgIndication(value)}
              renderInput={(params) => <TextField {...params} label="Indication de l'IMG" />}
            />
          </BlockWrapper>

          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Présentation à l'entrée en travail ou en début de césarienne
            </FormLabel>
            <Autocomplete
              multiple
              id="labor-or-cesarean-entry-autocomplete"
              options={/*criteriaData.data.laborOrCesareanEntry ||*/ booleanFieldsData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={laborOrCesareanEntry}
              onChange={(e, value) => setLaborOrCesareanEntry(value)}
              renderInput={(params) => (
                <TextField {...params} label="Présentation à l'entrée en travail ou en début de césarienne" />
              )}
            />
          </BlockWrapper>

          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Pathologie pendant le travail
            </FormLabel>
            <Autocomplete
              multiple
              id="pathology-during-labor-autocomplete"
              options={/*criteriaData.data.pathologyDuringLabor ||*/ booleanFieldsData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={pathologyDuringLabor}
              onChange={(e, value) => setPathologyDuringLabor(value)}
              renderInput={(params) => <TextField {...params} label="Pathologie pendant le travail" />}
            />
          </BlockWrapper>

          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Geste ou manoeuvre obstétricale pendant le travail
            </FormLabel>
            <Autocomplete
              multiple
              id="obstetrical-gesture-during-labor-autocomplete"
              options={/*criteriaData.data.obstetricalGestureDuringLabor ||*/ booleanFieldsData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={obstetricalGestureDuringLabor}
              onChange={(e, value) => setObstetricalGestureDuringLabor(value)}
              renderInput={(params) => (
                <TextField {...params} label="Geste ou manoeuvre obstétricale pendant le travail" />
              )}
            />
          </BlockWrapper>
        </Collapse>
      </BlockWrapper>

      <BlockWrapper className={classes.inputItem}>
        <Collapse title="ANALGESIE / ANESTHESIE" value={false}>
          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              ANALGESIE / ANESTHESIE - type
            </FormLabel>
            <Autocomplete
              multiple
              id="analgesie-type-autocomplete"
              options={/*criteriaData.data.analgesieType ||*/ booleanFieldsData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={analgesieType}
              onChange={(e, value) => setAnalgesieType(value)}
              renderInput={(params) => <TextField {...params} label="ANALGESIE / ANESTHESIE - type" />}
            />
          </BlockWrapper>
        </Collapse>
      </BlockWrapper>

      <BlockWrapper className={classes.inputItem}>
        <Collapse title="ACCOUCHEMENT ET NAISSANCE" value={false}>
          <BlockWrapper style={{ margin: '0 2em 1em 0' }}>
            <FormLabel component="legend" className={classes.durationLegend} style={{ padding: 0 }}>
              Date/heure de l'accouchement
            </FormLabel>
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

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Accouchement - Terme - Semaines
            </FormLabel>
            <OccurenceInput
              value={parity}
              comparator={parityComparator}
              onchange={(newParity, newComparator) => {
                setParity(newParity)
                setParityComparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Accouchement - Terme - Jours
            </FormLabel>
            <OccurenceInput
              value={parity}
              comparator={parityComparator}
              onchange={(newParity, newComparator) => {
                setParity(newParity)
                setParityComparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Voie d’accouchement
            </FormLabel>

            <Autocomplete
              multiple
              id="risks-or-complications-of-pregnancy-autocomplete"
              options={/*criteriaData.data.risksOrComplicationsOfPregnancy*/ risksOrComplicationsOfPregnancyData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={risksOrComplicationsOfPregnancy}
              onChange={(e, value) => setRisksOrComplicationsOfPregnancy(value)}
              renderInput={(params) => <TextField {...params} label="Risques ou complications de la grossesse" />}
              style={{ marginBottom: '1em' }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Type d'instrument
            </FormLabel>

            <Autocomplete
              multiple
              id="risks-or-complications-of-pregnancy-autocomplete"
              options={/*criteriaData.data.risksOrComplicationsOfPregnancy*/ risksOrComplicationsOfPregnancyData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={risksOrComplicationsOfPregnancy}
              onChange={(e, value) => setRisksOrComplicationsOfPregnancy(value)}
              renderInput={(params) => <TextField {...params} label="Risques ou complications de la grossesse" />}
              style={{ marginBottom: '1em' }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Modalités de la césarienne
            </FormLabel>

            <Autocomplete
              multiple
              id="risks-or-complications-of-pregnancy-autocomplete"
              options={/*criteriaData.data.risksOrComplicationsOfPregnancy*/ risksOrComplicationsOfPregnancyData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={risksOrComplicationsOfPregnancy}
              onChange={(e, value) => setRisksOrComplicationsOfPregnancy(value)}
              renderInput={(params) => <TextField {...params} label="Risques ou complications de la grossesse" />}
              style={{ marginBottom: '1em' }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Présentation à l'accouchement
            </FormLabel>

            <Autocomplete
              multiple
              id="risks-or-complications-of-pregnancy-autocomplete"
              options={/*criteriaData.data.risksOrComplicationsOfPregnancy*/ risksOrComplicationsOfPregnancyData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={risksOrComplicationsOfPregnancy}
              onChange={(e, value) => setRisksOrComplicationsOfPregnancy(value)}
              renderInput={(params) => <TextField {...params} label="Risques ou complications de la grossesse" />}
              style={{ marginBottom: '1em' }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Mensurations naissance - Poids (g)
            </FormLabel>
            <OccurenceInput
              value={parity}
              comparator={parityComparator}
              onchange={(newParity, newComparator) => {
                setParity(newParity)
                setParityComparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Mensurations naissance - Poids (percentile)
            </FormLabel>
            <OccurenceInput
              value={parity}
              comparator={parityComparator}
              onchange={(newParity, newComparator) => {
                setParity(newParity)
                setParityComparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Score Apgar - 1 min
            </FormLabel>
            <OccurenceInput
              value={parity}
              comparator={parityComparator}
              onchange={(newParity, newComparator) => {
                setParity(newParity)
                setParityComparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Score Apgar - 3 min
            </FormLabel>
            <OccurenceInput
              value={parity}
              comparator={parityComparator}
              onchange={(newParity, newComparator) => {
                setParity(newParity)
                setParityComparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Score Apgar - 5 min
            </FormLabel>
            <OccurenceInput
              value={parity}
              comparator={parityComparator}
              onchange={(newParity, newComparator) => {
                setParity(newParity)
                setParityComparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Score Apgar - 10 min
            </FormLabel>
            <OccurenceInput
              value={parity}
              comparator={parityComparator}
              onchange={(newParity, newComparator) => {
                setParity(newParity)
                setParityComparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <FormLabel component="legend" className={classes.durationLegend}>
              pH artériel au cordon
            </FormLabel>
            <OccurenceInput
              value={parity}
              comparator={parityComparator}
              onchange={(newParity, newComparator) => {
                setParity(newParity)
                setParityComparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Lactates artériel au cordon (mmol/L)
            </FormLabel>
            <OccurenceInput
              value={parity}
              comparator={parityComparator}
              onchange={(newParity, newComparator) => {
                setParity(newParity)
                setParityComparator(newComparator)
              }}
            />
          </BlockWrapper>
        </Collapse>
      </BlockWrapper>

      <BlockWrapper className={classes.inputItem}>
        <Collapse title="SUITES DE COUCHES" value={false}>
          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Type d'allaitement
            </FormLabel>
            <Autocomplete
              multiple
              id="feeding-type-autocomplete"
              options={/*criteriaData.data.feedingType ||*/ booleanFieldsData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={feedingType}
              onChange={(e, value) => setFeedingType(value)}
              renderInput={(params) => <TextField {...params} label="Type d'allaitement" />}
            />
          </BlockWrapper>

          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Complications
            </FormLabel>
            <Autocomplete
              multiple
              id="complication-autocomplete"
              options={/*criteriaData.data.complication ||*/ booleanFieldsData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={complication}
              onChange={(e, value) => setComplication(value)}
              renderInput={(params) => <TextField {...params} label="Complications" />}
            />
          </BlockWrapper>
        </Collapse>
      </BlockWrapper>

      <BlockWrapper className={classes.inputItem}>
        <Collapse title="SORTIE" value={false}>
          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Mode d'allaitement à la sortie
            </FormLabel>
            <Autocomplete
              multiple
              id="exit-feeding-mode-autocomplete"
              options={/*criteriaData.data.exitFeedingMode ||*/ booleanFieldsData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={exitFeedingMode}
              onChange={(e, value) => setExitFeedingMode(value)}
              renderInput={(params) => <TextField {...params} label="Mode d'allaitement à la sortie" />}
            />
          </BlockWrapper>

          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Diagnostic de sortie
            </FormLabel>
            <Autocomplete
              multiple
              id="exit-diagnostic-autocomplete"
              options={/*criteriaData.data.exitDiagnostic ||*/ booleanFieldsData || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={exitDiagnostic}
              onChange={(e, value) => setExitDiagnostic(value)}
              renderInput={(params) => <TextField {...params} label="Diagnostic de sortie" />}
            />
          </BlockWrapper>
        </Collapse>
      </BlockWrapper>
    </CriteriaLayout>
  )
}

export default HospitForm
