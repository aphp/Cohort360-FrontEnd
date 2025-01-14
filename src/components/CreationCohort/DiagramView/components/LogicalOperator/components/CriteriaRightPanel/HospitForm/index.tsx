/* eslint-disable max-statements */
import React, { useEffect, useState } from 'react'

import { Autocomplete, TextField } from '@mui/material'

import useStyles from './styles'

import { CriteriaDrawerComponentProps, ScopeElement } from 'types'
import { LabelObject } from 'types/searchCriterias'
import { Comparators, CriteriaDataKey, HospitDataType, CriteriaType, CriteriaTypeLabels } from 'types/requestCriterias'
import { BlockWrapper } from 'components/ui/Layout'
import OccurenceInput from 'components/ui/Inputs/Occurences'
import Collapse from 'components/ui/Collapse'
import SearchbarWithCheck from 'components/ui/Inputs/SearchbarWithCheck'
import CriteriaLayout from 'components/ui/CriteriaLayout'
import CalendarRange from 'components/ui/Inputs/CalendarRange'
import NumericConditionInput from 'components/ui/Inputs/OccurencesWithFloats'
import { SourceType } from 'types/scope'
import { Hierarchy } from 'types/hierarchy'
import { CriteriaLabel } from 'components/ui/CriteriaLabel'
import ExecutiveUnitsInput from 'components/ui/Inputs/ExecutiveUnits'
import { mappingCriteria } from 'utils/mappers'

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
  const [hospitalChildBirthPlace, setHospitalChildBirthPlace] = useState<LabelObject[]>(
    mappingCriteria(criteria?.hospitalChildBirthPlace, CriteriaDataKey.HOSPITALCHILDBIRTHPLACE, criteriaData)
  )
  const [otherHospitalChildBirthPlace, setOtherHospitalChildBirthPlace] = useState<LabelObject[]>(
    mappingCriteria(criteria?.otherHospitalChildBirthPlace, CriteriaDataKey.OTHERHOSPITALCHILDBIRTHPLACE, criteriaData)
  )
  const [homeChildBirthPlace, setHomeChildBirthPlace] = useState<LabelObject[]>(
    mappingCriteria(criteria?.homeChildBirthPlace, CriteriaDataKey.HOMECHILDBIRTHPLACE, criteriaData)
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
  const [birthDeliveryStartDate, setBirthDeliveryStartDate] = useState<string | null | undefined>(
    criteria?.birthDeliveryStartDate || null
  )
  const [birthDeliveryEndDate, setBirthDeliveryEndDate] = useState<string | null | undefined>(
    criteria?.birthDeliveryEndDate || null
  )
  const [birthDeliveryWeeks, setBirthDeliveryWeeks] = useState<number>(criteria?.birthDeliveryWeeks || 0)
  const [birthDeliveryWeeksComparator, setBirthDeliveryWeeksComparator] = useState<Comparators>(
    criteria?.birthDeliveryWeeksComparator || Comparators.GREATER_OR_EQUAL
  )
  const [birthDeliveryDays, setBirthDeliveryDays] = useState<number>(criteria?.birthDeliveryDays || 0)
  const [birthDeliveryDaysComparator, setBirthDeliveryDaysComparator] = useState<Comparators>(
    criteria?.birthDeliveryDaysComparator || Comparators.GREATER_OR_EQUAL
  )
  const [birthDeliveryWay, setBirthDeliveryWay] = useState<LabelObject[]>(
    mappingCriteria(criteria?.birthDeliveryWay, CriteriaDataKey.BIRTH_DELIVERY_WAY, criteriaData) || []
  )
  const [instrumentType, setInstrumentType] = useState<LabelObject[]>(
    mappingCriteria(criteria?.instrumentType, CriteriaDataKey.INSTRUMENT_TYPE, criteriaData) || []
  )
  const [cSectionModality, setCSectionModality] = useState<LabelObject[]>(
    mappingCriteria(criteria?.cSectionModality, CriteriaDataKey.C_SECTION_MODALITY, criteriaData) || []
  )
  const [presentationAtDelivery, setPresentationAtDelivery] = useState<LabelObject[]>(
    mappingCriteria(criteria?.presentationAtDelivery, CriteriaDataKey.PRESENTATION_AT_DELIVERY, criteriaData) || []
  )
  const [birthMensurationsGrams, setBirthMensurationsGrams] = useState<number>(criteria?.birthMensurationsGrams || 0)
  const [birthMensurationsGramsComparator, setBirthMensurationsGramsComparator] = useState<Comparators>(
    criteria?.birthMensurationsGramsComparator || Comparators.GREATER_OR_EQUAL
  )
  const [birthMensurationsPercentil, setBirthMensurationsPercentil] = useState<number>(
    criteria?.birthMensurationsPercentil || 0
  )
  const [birthMensurationsPercentilComparator, setBirthMensurationsPercentilComparator] = useState<Comparators>(
    criteria?.birthMensurationsPercentilComparator || Comparators.GREATER_OR_EQUAL
  )
  const [apgar1, setApgar1] = useState<number>(criteria?.apgar1 || 0)
  const [apgar1Comparator, setApgar1Comparator] = useState<Comparators>(
    criteria?.apgar1Comparator || Comparators.GREATER_OR_EQUAL
  )
  const [apgar3, setApgar3] = useState<number>(criteria?.apgar3 || 0)
  const [apgar3Comparator, setApgar3Comparator] = useState<Comparators>(
    criteria?.apgar3Comparator || Comparators.GREATER_OR_EQUAL
  )
  const [apgar5, setApgar5] = useState<number>(criteria?.apgar5 || 0)
  const [apgar5Comparator, setApgar5Comparator] = useState<Comparators>(
    criteria?.apgar5Comparator || Comparators.GREATER_OR_EQUAL
  )
  const [apgar10, setApgar10] = useState<number>(criteria?.apgar10 || 0)
  const [apgar10Comparator, setApgar10Comparator] = useState<Comparators>(
    criteria?.apgar10Comparator || Comparators.GREATER_OR_EQUAL
  )
  const [arterialPhCord, setArterialPhCord] = useState<number>(criteria?.arterialPhCord || 0)
  const [arterialPhCordComparator, setArterialPhCordComparator] = useState<Comparators>(
    criteria?.arterialPhCordComparator || Comparators.GREATER_OR_EQUAL
  )
  const [arterialCordLactates, setArterialCordLactates] = useState<number>(criteria?.arterialCordLactates || 0)
  const [arterialCordLactatesComparator, setArterialCordLactatesComparator] = useState<Comparators>(
    criteria?.arterialCordLactatesComparator || Comparators.GREATER_OR_EQUAL
  )
  const [birthStatus, setBirthStatus] = useState<LabelObject[]>(
    mappingCriteria(criteria?.birthStatus, CriteriaDataKey.BIRTHSTATUS, criteriaData) || []
  )
  const [postpartumHemorrhage, setPostpartumHemorrhage] = useState<LabelObject[]>(
    mappingCriteria(criteria?.postpartumHemorrhage, CriteriaDataKey.POSTPARTUM_HEMORRHAGE, criteriaData) || []
  )
  const [conditionPerineum, setConditionPerineum] = useState<LabelObject[]>(
    mappingCriteria(criteria?.conditionPerineum, CriteriaDataKey.CONDITION_PERINEUM, criteriaData) || []
  )
  const [exitPlaceType, setExitPlaceType] = useState<LabelObject[]>(
    mappingCriteria(criteria?.exitPlaceType, CriteriaDataKey.EXIT_PLACE_TYPE, criteriaData) || []
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
  const [encounterStatus, setEncounterStatus] = useState<LabelObject[]>(
    mappingCriteria(criteria?.encounterStatus, CriteriaDataKey.ENCOUNTER_STATUS, criteriaData) || []
  )
  const [encounterService, setEncounterService] = useState<Hierarchy<ScopeElement>[]>(criteria?.encounterService || [])
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
      type: CriteriaType.HOSPIT,
      id: criteria?.id,
      hospitReason,
      inUteroTransfer,
      pregnancyMonitoring,
      vme,
      maturationCorticotherapie,
      chirurgicalGesture,
      childbirth,
      hospitalChildBirthPlace,
      otherHospitalChildBirthPlace,
      homeChildBirthPlace,
      childbirthMode,
      maturationReason,
      maturationModality,
      imgIndication,
      laborOrCesareanEntry,
      pathologyDuringLabor,
      obstetricalGestureDuringLabor,
      analgesieType,
      birthDeliveryStartDate,
      birthDeliveryEndDate,
      birthDeliveryWeeks,
      birthDeliveryWeeksComparator,
      birthDeliveryDays,
      birthDeliveryDaysComparator,
      birthDeliveryWay,
      instrumentType,
      cSectionModality,
      presentationAtDelivery,
      birthMensurationsGrams,
      birthMensurationsGramsComparator,
      birthMensurationsPercentil,
      birthMensurationsPercentilComparator,
      apgar1,
      apgar1Comparator,
      apgar3,
      apgar3Comparator,
      apgar5,
      apgar5Comparator,
      apgar10,
      apgar10Comparator,
      arterialPhCord,
      arterialPhCordComparator,
      arterialCordLactates,
      arterialCordLactatesComparator,
      birthStatus,
      postpartumHemorrhage,
      conditionPerineum,
      exitPlaceType,
      feedingType,
      complication,
      exitFeedingMode,
      exitDiagnostic,
      encounterService,
      occurrence,
      occurrenceComparator,
      encounterStatus,
      isInclusive,
      startOccurrence: [null, null],
      title
    })
  }
  return (
    <CriteriaLayout
      criteriaLabel={`de ${CriteriaTypeLabels.HOSPIT}`}
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
        <Collapse title="ADMISSION" value={false} margin="0">
          <BlockWrapper style={{ marginBottom: '1em' }}>
            <SearchbarWithCheck
              searchInput={hospitReason}
              setSearchInput={setHospitReason}
              placeholder="Motif(s) d'hospitalisation"
              onError={(isError) => setError(isError ? Error.SEARCHINPUT_ERROR : Error.NO_ERROR)}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Transfert in utero" />
            <Autocomplete
              multiple
              noOptionsText='Veuillez entrer "oui" ou "non"'
              id="in-utero-transfer-autocomplete"
              options={criteriaData.data.inUteroTransfer || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={inUteroTransfer}
              onChange={(e, value) => setInUteroTransfer(value)}
              renderInput={(params) => <TextField {...params} label="Transfert in utero" />}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Grossesse peu ou pas suivie" />
            <Autocomplete
              multiple
              noOptionsText='Veuillez entrer "oui" ou "non"'
              id="pregnancy-monitoring-autocomplete"
              options={criteriaData.data.pregnancyMonitoring || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={pregnancyMonitoring}
              onChange={(e, value) => setPregnancyMonitoring(value)}
              renderInput={(params) => <TextField {...params} label="Grossesse peu ou pas suivie" />}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="VME" />
            <Autocomplete
              multiple
              noOptionsText="Veuillez entrer des valeurs de VME"
              id="vme-autocomplete"
              options={criteriaData.data.vme || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={vme}
              onChange={(e, value) => setVme(value)}
              renderInput={(params) => <TextField {...params} label="VME" />}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Corticothérapie pour maturation fœtale faite" />
            <Autocomplete
              multiple
              noOptionsText='Veuillez entrer "oui" ou "non"'
              id="maturation-corticotherapie-autocomplete"
              options={criteriaData.data.maturationCorticotherapie || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={maturationCorticotherapie}
              onChange={(e, value) => setMaturationCorticotherapie(value)}
              renderInput={(params) => <TextField {...params} label="Corticothérapie pour maturation foetale faite" />}
            />
          </BlockWrapper>

          <CriteriaLabel label="Type de geste ou de chirurgie" />
          <Autocomplete
            multiple
            noOptionsText="Veuillez entrer un type de geste ou de chirurgie"
            id="chirurgical-gesture-autocomplete"
            options={criteriaData.data.chirurgicalGesture || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={chirurgicalGesture}
            onChange={(e, value) => setChirurgicalGesture(value)}
            renderInput={(params) => <TextField {...params} label="Type de geste ou de chirurgie" />}
          />
        </Collapse>
      </BlockWrapper>

      <BlockWrapper className={classes.inputItem}>
        <Collapse title="SYNTHESE" value={false} margin="0">
          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Accouchement" />
            <Autocomplete
              multiple
              noOptionsText='Veuillez entrer "oui" ou "non"'
              id="childbirth-autocomplete"
              options={criteriaData.data.childbirth || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={childbirth}
              onChange={(e, value) => setChildbirth(value)}
              renderInput={(params) => <TextField {...params} label="Accouchement" />}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Accouchement à la maternité de l'hospitalisation" />
            <Autocomplete
              multiple
              noOptionsText='Veuillez entrer "oui" ou "non"'
              id="hospital-childbirth-place-autocomplete"
              options={criteriaData.data.hospitalChildBirthPlace || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={hospitalChildBirthPlace}
              onChange={(e, value) => setHospitalChildBirthPlace(value)}
              renderInput={(params) => (
                <TextField {...params} label="Accouchement à la maternité de l'hospitalisation" />
              )}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Accouchement dans un autre hôpital" />
            <Autocomplete
              multiple
              noOptionsText='Veuillez entrer "oui" ou "non"'
              id="other-hospital-childbirth-place-autocomplete"
              options={criteriaData.data.otherHospitalChildBirthPlace || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={otherHospitalChildBirthPlace}
              onChange={(e, value) => setOtherHospitalChildBirthPlace(value)}
              renderInput={(params) => <TextField {...params} label="Accouchement dans un autre hôpital" />}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Accouchement à domicile" />
            <Autocomplete
              multiple
              noOptionsText='Veuillez entrer "oui" ou "non"'
              id="home-childbirth-place-autocomplete"
              options={criteriaData.data.homeChildBirthPlace || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={homeChildBirthPlace}
              onChange={(e, value) => setHomeChildBirthPlace(value)}
              renderInput={(params) => <TextField {...params} label="Accouchement à domicile" />}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Mode de mise en travail" />
            <Autocomplete
              multiple
              noOptionsText="Veuillez entrer un mode de mise en travail"
              id="childbirth-mode-autocomplete"
              options={criteriaData.data.childbirthMode || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={childbirthMode}
              onChange={(e, value) => setChildbirthMode(value)}
              renderInput={(params) => <TextField {...params} label="Mode de mise en travail" />}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Motif(s) de maturation / déclenchement" />
            <Autocomplete
              multiple
              noOptionsText="Veuillez entrer un motif de maturation / déclenchement"
              id="maturation-reason-autocomplete"
              options={criteriaData.data.maturationReason || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={maturationReason}
              onChange={(e, value) => setMaturationReason(value)}
              renderInput={(params) => <TextField {...params} label="Motif(s) de maturation / déclenchement" />}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Modalités de maturation cervicale initiale" />
            <Autocomplete
              multiple
              noOptionsText="Veuillez entrer une modalité de maturation cervicale initiale"
              id="maturation-modality-autocomplete"
              options={criteriaData.data.maturationModality || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={maturationModality}
              onChange={(e, value) => setMaturationModality(value)}
              renderInput={(params) => <TextField {...params} label="Modalités de maturation cervicale initiale" />}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Indication de l'IMG" />
            <Autocomplete
              multiple
              noOptionsText="Veuillez entrer une indication de l'IMG"
              id="img-indication-autocomplete"
              options={criteriaData.data.imgIndication || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={imgIndication}
              onChange={(e, value) => setImgIndication(value)}
              renderInput={(params) => <TextField {...params} label="Indication de l'IMG" />}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Présentation à l'entrée en travail ou en début de césarienne" />
            <Autocomplete
              multiple
              noOptionsText="Veuillez entrer une présentation à l'entrée en travail ou en début de césarienne"
              id="labor-or-cesarean-entry-autocomplete"
              options={criteriaData.data.laborOrCesareanEntry || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={laborOrCesareanEntry}
              onChange={(e, value) => setLaborOrCesareanEntry(value)}
              renderInput={(params) => (
                <TextField {...params} label="Présentation à l'entrée en travail ou en début de césarienne" />
              )}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Pathologie pendant le travail" />
            <Autocomplete
              multiple
              noOptionsText="Veuillez entrer une pathologie pendant le travail"
              id="pathology-during-labor-autocomplete"
              options={criteriaData.data.pathologyDuringLabor || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={pathologyDuringLabor}
              onChange={(e, value) => setPathologyDuringLabor(value)}
              renderInput={(params) => <TextField {...params} label="Pathologie pendant le travail" />}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Geste ou manoeuvre obstétricale pendant le travail" />
            <Autocomplete
              multiple
              noOptionsText="Veuillez entrer un geste ou manoeuvre obstétricale pendant le travail"
              id="obstetrical-gesture-during-labor-autocomplete"
              options={criteriaData.data.obstetricalGestureDuringLabor || []}
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
        <Collapse title="ANALGESIE / ANESTHESIE" value={false} margin="0">
          <CriteriaLabel label="Analgésie / Anesthésie - Type" />
          <Autocomplete
            multiple
            noOptionsText="Veuillez entrer un type d'Analgésie / Anesthésie - Type"
            id="analgesie-type-autocomplete"
            options={criteriaData.data.analgesieType || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={analgesieType}
            onChange={(e, value) => setAnalgesieType(value)}
            renderInput={(params) => <TextField {...params} label="Analgésie / Anesthésie - Type" />}
          />
        </Collapse>
      </BlockWrapper>

      <BlockWrapper className={classes.inputItem}>
        <Collapse title="ACCOUCHEMENT ET NAISSANCE" value={false} margin="0">
          <BlockWrapper style={{ margin: '0 2em 1em 0' }}>
            <CriteriaLabel label="Date/heure de l'accouchement" style={{ padding: 0 }} />
            <CalendarRange
              inline
              value={[birthDeliveryStartDate, birthDeliveryEndDate]}
              onChange={([start, end]) => {
                setBirthDeliveryStartDate(start)
                setBirthDeliveryEndDate(end)
              }}
              onError={(isError) => setError(isError ? Error.INCOHERENT_AGE_ERROR : Error.NO_ERROR)}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <OccurenceInput
              label="Accouchement - Terme - Semaines"
              value={birthDeliveryWeeks}
              comparator={birthDeliveryWeeksComparator}
              onchange={(newBirthdaydeliveryWeeks, newComparator) => {
                setBirthDeliveryWeeks(newBirthdaydeliveryWeeks)
                setBirthDeliveryWeeksComparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <OccurenceInput
              label="Accouchement - Terme - Jours"
              value={birthDeliveryDays}
              comparator={birthDeliveryDaysComparator}
              onchange={(newbirthDeliveryDays, newComparator) => {
                setBirthDeliveryDays(newbirthDeliveryDays)
                setBirthDeliveryDaysComparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Voie d’accouchement" />
            <Autocomplete
              multiple
              noOptionsText="Veuillez entrer une voie d’accouchement"
              id="birth-delivery-way-autocomplete"
              options={criteriaData.data.birthDeliveryWay || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={birthDeliveryWay}
              onChange={(e, value) => setBirthDeliveryWay(value)}
              renderInput={(params) => <TextField {...params} label="Voie d’accouchement" />}
              style={{ marginBottom: '1em' }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Type d'instrument" />
            <Autocomplete
              multiple
              noOptionsText="Veuillez entrer un type d'instrument"
              id="instrument-type-autocomplete"
              options={criteriaData.data.instrumentType || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={instrumentType}
              onChange={(e, value) => setInstrumentType(value)}
              renderInput={(params) => <TextField {...params} label="Type d'instrument" />}
              style={{ marginBottom: '1em' }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Modalités de la césarienne" />
            <Autocomplete
              multiple
              noOptionsText="Veuillez entrer une modalité de la césarienne"
              id="c-section-modality-autocomplete"
              options={criteriaData.data.cSectionModality || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={cSectionModality}
              onChange={(e, value) => setCSectionModality(value)}
              renderInput={(params) => <TextField {...params} label="Modalités de la césarienne" />}
              style={{ marginBottom: '1em' }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Présentation à l'accouchement" />
            <Autocomplete
              multiple
              noOptionsText="Veuillez entrer une présentation à l'accouchement"
              id="presentation-at-delivery-autocomplete"
              options={criteriaData.data.presentationAtDelivery || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={presentationAtDelivery}
              onChange={(e, value) => setPresentationAtDelivery(value)}
              renderInput={(params) => <TextField {...params} label="Présentation à l'accouchement" />}
              style={{ marginBottom: '1em' }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <OccurenceInput
              label="Mensurations naissance - Poids (g)"
              value={birthMensurationsGrams}
              comparator={birthMensurationsGramsComparator}
              onchange={(newBirthMensurations, newComparator) => {
                setBirthMensurationsGrams(newBirthMensurations)
                setBirthMensurationsGramsComparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Mensurations naissance - Poids (percentile)" />
            <NumericConditionInput
              value={birthMensurationsPercentil}
              comparator={birthMensurationsPercentilComparator}
              onchange={(newbirthMensurationsPercentil, newComparator) => {
                setBirthMensurationsPercentil(newbirthMensurationsPercentil)
                setBirthMensurationsPercentilComparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <OccurenceInput
              label="Score Apgar - 1 min"
              value={apgar1}
              comparator={apgar1Comparator}
              onchange={(newapgar1, newComparator) => {
                setApgar1(newapgar1)
                setApgar1Comparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <OccurenceInput
              label="Score Apgar - 3 min"
              value={apgar3}
              comparator={apgar3Comparator}
              onchange={(newapgar3, newComparator) => {
                setApgar3(newapgar3)
                setApgar3Comparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <OccurenceInput
              label="Score Apgar - 5 min"
              value={apgar5}
              comparator={apgar5Comparator}
              onchange={(newapgar5, newComparator) => {
                setApgar5(newapgar5)
                setApgar5Comparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <OccurenceInput
              label="Score Apgar - 10 min"
              value={apgar10}
              comparator={apgar10Comparator}
              onchange={(newapgar10, newComparator) => {
                setApgar10(newapgar10)
                setApgar10Comparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="pH artériel au cordon" />
            <NumericConditionInput
              value={arterialPhCord}
              comparator={arterialPhCordComparator}
              onchange={(newarterialPhCord, newComparator) => {
                setArterialPhCord(newarterialPhCord)
                setArterialPhCordComparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Lactate artériel au cordon (mmol/L)" />
            <NumericConditionInput
              value={arterialCordLactates}
              comparator={arterialCordLactatesComparator}
              onchange={(newarterialCordLactates, newComparator) => {
                setArterialCordLactates(newarterialCordLactates)
                setArterialCordLactatesComparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Statut vital à la naissance" />
            <Autocomplete
              multiple
              noOptionsText="Veuillez entrer un statut vital à la naissance"
              id="birth-status-autocomplete"
              options={criteriaData.data.birthStatus || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={birthStatus}
              onChange={(e, value) => setBirthStatus(value)}
              renderInput={(params) => <TextField {...params} label="Statut vital à la naissance" />}
              style={{ marginBottom: '1em' }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Hémorragie du post-partum" />
            <Autocomplete
              multiple
              noOptionsText='Veuillez entrer "oui" ou "non"'
              id="Postpartum-hemorrhage-autocomplete"
              options={criteriaData.data.postpartumHemorrhage || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={postpartumHemorrhage}
              onChange={(e, value) => setPostpartumHemorrhage(value)}
              renderInput={(params) => <TextField {...params} label="Hémorragie du post-partum" />}
              style={{ marginBottom: '1em' }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="État du périnée" />
            <Autocomplete
              multiple
              noOptionsText="Veuillez entrer un état du périnée"
              id="condition-of-the-perineum-autocomplete"
              options={criteriaData.data.conditionPerineum || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={conditionPerineum}
              onChange={(e, value) => setConditionPerineum(value)}
              renderInput={(params) => <TextField {...params} label="État du périnée" />}
              style={{ marginBottom: '1em' }}
            />
          </BlockWrapper>

          <CriteriaLabel label="Type de lieu de sortie" />
          <Autocomplete
            multiple
            noOptionsText="Veuillez entrer un type de lieu de sortie"
            id="exit-place-type-autocomplete"
            options={criteriaData.data.exitPlaceType || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={exitPlaceType}
            onChange={(e, value) => setExitPlaceType(value)}
            renderInput={(params) => <TextField {...params} label="Type de lieu de sortie" />}
            style={{ marginBottom: '1em' }}
          />
        </Collapse>
      </BlockWrapper>

      <BlockWrapper className={classes.inputItem}>
        <Collapse title="SUITES DE COUCHES" value={false} margin="0">
          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Type d'allaitement" />
            <Autocomplete
              multiple
              noOptionsText="Veuillez entrer un type d'allaitement"
              id="feeding-type-autocomplete"
              options={criteriaData.data.feedingType || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={feedingType}
              onChange={(e, value) => setFeedingType(value)}
              renderInput={(params) => <TextField {...params} label="Type d'allaitement" />}
            />
          </BlockWrapper>

          <CriteriaLabel label="Aucune complication" />
          <Autocomplete
            multiple
            noOptionsText='Veuillez entrer "oui" ou "non"'
            id="complication-autocomplete"
            options={criteriaData.data.complication || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={complication}
            onChange={(e, value) => setComplication(value)}
            renderInput={(params) => <TextField {...params} label="Aucune complication" />}
          />
        </Collapse>
      </BlockWrapper>

      <BlockWrapper className={classes.inputItem}>
        <Collapse title="SORTIE" value={false} margin="0">
          <BlockWrapper style={{ marginBottom: '1em' }}>
            <CriteriaLabel label="Mode d'allaitement à la sortie" />
            <Autocomplete
              multiple
              noOptionsText="Veuillez entrer un mode d'allaitement à la sortie"
              id="exit-feeding-mode-autocomplete"
              options={criteriaData.data.exitFeedingMode || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={exitFeedingMode}
              onChange={(e, value) => setExitFeedingMode(value)}
              renderInput={(params) => <TextField {...params} label="Mode d'allaitement à la sortie" />}
            />
          </BlockWrapper>

          <CriteriaLabel label="Diagnostic de sortie" />
          <Autocomplete
            multiple
            noOptionsText="Veuillez entrer un diagnostic de sortie"
            id="exit-diagnostic-autocomplete"
            options={criteriaData.data.exitDiagnostic || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={exitDiagnostic}
            onChange={(e, value) => setExitDiagnostic(value)}
            renderInput={(params) => <TextField {...params} label="Diagnostic de sortie" />}
          />
        </Collapse>
      </BlockWrapper>
    </CriteriaLayout>
  )
}

export default HospitForm
