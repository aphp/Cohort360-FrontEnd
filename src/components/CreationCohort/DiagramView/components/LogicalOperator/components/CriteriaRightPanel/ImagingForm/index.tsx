import React, { useState } from 'react'
import { Autocomplete, FormLabel, Grid, MenuItem, Select, TextField } from '@mui/material'
import { BlockWrapper } from 'components/ui/Layout'
import CalendarRange from 'components/ui/Inputs/CalendarRange'
import Collapse from 'components/ui/Collapse'
import { DurationUnitWrapper } from 'components/ui/Inputs/DurationRange/styles'
import { TextFieldWrapper } from 'components/ui/Inputs/DurationRange/styles'
import OccurenceInput from 'components/ui/Inputs/Occurences'
import CriteriaLayout from 'components/ui/CriteriaLayout'
import AdvancedInputs from '../AdvancedInputs/AdvancedInputs'

import { CriteriaDrawerComponentProps, CriteriaName } from 'types'
import { CalendarRequestLabel } from 'types/dates'
import { Comparators, CriteriaDataKey, ImagingDataType, CriteriaType, CriteriaTypeLabels } from 'types/requestCriterias'
import { DocumentAttachmentMethod, DocumentAttachmentMethodLabel, LabelObject } from 'types/searchCriterias'
import useStyles from './styles'
import { mappingCriteria } from '../DemographicForm'
import SearchbarWithCheck from 'components/ui/Inputs/SearchbarWithCheck'
import UidTextfield from 'components/ui/Inputs/UidTextfield'

enum Error {
  INCOHERENT_AGE_ERROR,
  SEARCHINPUT_ERROR,
  UID_ERROR,
  NO_ERROR
}

export const withDocumentOptions = [
  {
    id: DocumentAttachmentMethod.NONE,
    label: DocumentAttachmentMethodLabel.NONE
  },
  {
    id: DocumentAttachmentMethod.ACCESS_NUMBER,
    label: DocumentAttachmentMethodLabel.ACCESS_NUMBER
  },
  {
    id: DocumentAttachmentMethod.INFERENCE_TEMPOREL,
    label: DocumentAttachmentMethodLabel.INFERENCE_TEMPOREL
  }
]

const ImagingForm: React.FC<CriteriaDrawerComponentProps> = (props) => {
  const { classes } = useStyles()
  const { criteriaData, onChangeSelectedCriteria, goBack } = props
  const selectedCriteria = props.selectedCriteria as ImagingDataType
  const isEdition = selectedCriteria !== null ? true : false
  const [title, setTitle] = useState(selectedCriteria?.title || "Critère d'Imagerie")
  const [occurrence, setOccurrence] = useState<number>(selectedCriteria?.occurrence || 1)
  const [occurrenceComparator, setOccurrenceComparator] = useState<Comparators>(
    selectedCriteria?.occurrenceComparator || Comparators.GREATER_OR_EQUAL
  )
  const [isInclusive, setIsInclusive] = useState<boolean>(
    selectedCriteria?.isInclusive === undefined ? true : selectedCriteria?.isInclusive
  )
  const [studyStartDate, setStudyStartDate] = useState<string | null>(selectedCriteria?.studyStartDate || null)
  const [studyEndDate, setStudyEndDate] = useState<string | null>(selectedCriteria?.studyEndDate || null)
  const [studyModalities, setStudyModalities] = useState<LabelObject[]>(
    mappingCriteria(selectedCriteria?.studyModalities, CriteriaDataKey.MODALITIES, criteriaData) || []
  )
  const [studyDescription, setStudyDescription] = useState<string>(selectedCriteria?.studyDescription || '')
  const [studyProcedure, setStudyProcedure] = useState<string>(selectedCriteria?.studyProcedure || '')
  const [numberOfSeries, setNumberOfSeries] = useState<number>(selectedCriteria?.numberOfSeries || 1)
  const [seriesComparator, setSeriesComparator] = useState<Comparators>(
    selectedCriteria?.seriesComparator || Comparators.GREATER_OR_EQUAL
  )
  const [numberOfIns, setNumberOfIns] = useState<number>(selectedCriteria?.numberOfIns || 1)
  const [instancesComparator, setInstancesComparator] = useState<Comparators>(
    selectedCriteria?.instancesComparator || Comparators.GREATER_OR_EQUAL
  )
  const [withDocument, setWithDocument] = useState<DocumentAttachmentMethod>(
    selectedCriteria?.withDocument || DocumentAttachmentMethod.NONE
  )
  const [daysOfDelay, setDaysOfDelay] = useState<string | null>(selectedCriteria?.daysOfDelay || null)
  const [studyUid, setStudyUid] = useState<string>(selectedCriteria?.studyUid || '')

  const [seriesStartDate, setSeriesStartDate] = useState<string | null>(selectedCriteria?.seriesStartDate || null)
  const [seriesEndDate, setSeriesEndDate] = useState<string | null>(selectedCriteria?.seriesEndDate || null)
  const [seriesDescription, setSeriesDescription] = useState<string>(selectedCriteria?.seriesDescription || '')
  const [seriesProtocol, setSeriesProtocol] = useState<string>(selectedCriteria?.seriesProtocol || '')
  const [seriesModalities, setSeriesModalities] = useState<LabelObject[]>(
    mappingCriteria(selectedCriteria?.seriesModalities, CriteriaDataKey.MODALITIES, criteriaData) || []
  )
  const [seriesUid, setSeriesUid] = useState<string>(selectedCriteria?.seriesUid || '')
  const [encounterService, setEncounterService] = useState(selectedCriteria?.encounterService || [])
  const [encounterStartDate, setEncounterStartDate] = useState(selectedCriteria?.encounterStartDate || null)
  const [encounterEndDate, setEncounterEndDate] = useState(selectedCriteria?.encounterEndDate || null)
  const [startOccurrence, setStartOccurence] = useState(selectedCriteria?.startOccurrence || null)
  const [endOccurrence, setEndOccurence] = useState(selectedCriteria?.endOccurrence || null)
  const [encounterStatus, setEncounterStatus] = useState<LabelObject[]>(
    mappingCriteria(selectedCriteria?.encounterStatus, CriteriaDataKey.ENCOUNTER_STATUS, criteriaData) || []
  )

  const [error, setError] = useState(Error.NO_ERROR)

  const _onChangeValue = (key: string, value: any) => {
    switch (key) {
      case 'encounterService':
        setEncounterService(value)
        break
      case 'encounterStartDate':
        setEncounterStartDate(value)
        break
      case 'encounterEndDate':
        setEncounterEndDate(value)
        break
      case 'startOccurrence':
        setStartOccurence(value)
        break
      case 'endOccurrence':
        setEndOccurence(value)
        break
      default:
        break
    }
  }

  const onSubmit = () => {
    onChangeSelectedCriteria({
      id: selectedCriteria?.id,
      type: CriteriaType.IMAGING,
      title,
      isInclusive,
      occurrence,
      occurrenceComparator,
      studyStartDate,
      studyEndDate,
      studyModalities,
      studyDescription,
      studyProcedure,
      numberOfSeries,
      seriesComparator,
      numberOfIns,
      instancesComparator,
      withDocument,
      daysOfDelay,
      studyUid,
      seriesStartDate,
      seriesEndDate,
      seriesDescription,
      seriesProtocol,
      seriesModalities,
      seriesUid,
      encounterService,
      encounterStartDate,
      encounterEndDate,
      startOccurrence,
      endOccurrence,
      encounterStatus
    })
  }

  const isSeriesUsed =
    !!seriesStartDate ||
    !!seriesEndDate ||
    !!seriesDescription ||
    !!seriesProtocol ||
    seriesModalities.length > 0 ||
    !!seriesUid

  return (
    <CriteriaLayout
      criteriaLabel={`d'${CriteriaTypeLabels.IMAGING}`}
      title={title}
      onChangeTitle={setTitle}
      isEdition={isEdition}
      goBack={goBack}
      onSubmit={onSubmit}
      disabled={error === Error.INCOHERENT_AGE_ERROR || error === Error.SEARCHINPUT_ERROR || error === Error.UID_ERROR}
      isInclusive={isInclusive}
      onChangeIsInclusive={setIsInclusive}
      infoAlert={['Tous les éléments des champs multiples sont liés par une contrainte OU']}
      warningAlert={[
        'Seuls les examens présents dans le PACS Philips et rattachés à un Dossier Administratif (NDA) sont actuellement disponibles.',
        "Le flux alimentant les métadonnées associées aux séries et aux examens est suspendu depuis le 01/02/2023 suite à la migration du PACS AP-HP. Aucun examen produit après cette date n'est disponible via Cohort360. Pour tout besoin d'examen post 01/02/2023, merci de contacter le support Cohort360 : dsn-id-recherche-support-cohort360@aphp.fr."
      ]}
    >
      <BlockWrapper margin="1em">
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
      <BlockWrapper margin="1em">
        <Autocomplete
          multiple
          options={criteriaData.data.encounterStatus || []}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={encounterStatus}
          onChange={(e, value) => setEncounterStatus(value)}
          renderInput={(params) => <TextField {...params} label="Statut de la visite associée" />}
        />
      </BlockWrapper>

      {/* critères de study : */}
      <BlockWrapper margin="1em">
        <Collapse title="Critères liés à une étude" margin="0">
          <BlockWrapper style={{ margin: '0 2em 1em 0' }}>
            <FormLabel component="legend" className={classes.durationLegend} style={{ padding: 0 }}>
              Date de l'étude
            </FormLabel>
            <CalendarRange
              inline
              value={[studyStartDate, studyEndDate]}
              onChange={([start, end]) => {
                setStudyStartDate(start || null)
                setStudyEndDate(end || null)
              }}
              onError={(isError) => setError(isError ? Error.INCOHERENT_AGE_ERROR : Error.NO_ERROR)}
            />
          </BlockWrapper>

          <Autocomplete
            multiple
            options={criteriaData?.data.modalities || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={studyModalities}
            onChange={(e, value) => setStudyModalities(value)}
            renderInput={(params) => <TextField {...params} label="Modalités" />}
            style={{ marginBottom: '1em' }}
          />

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <SearchbarWithCheck
              searchInput={studyDescription}
              setSearchInput={setStudyDescription}
              placeholder="Rechercher dans les descriptions"
              onError={(isError) => setError(isError ? Error.SEARCHINPUT_ERROR : Error.NO_ERROR)}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <SearchbarWithCheck
              searchInput={studyProcedure}
              setSearchInput={setStudyProcedure}
              placeholder="Rechercher dans les codes procédures"
              onError={(isError) => setError(isError ? Error.SEARCHINPUT_ERROR : Error.NO_ERROR)}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Nombre de séries
            </FormLabel>
            <OccurenceInput
              value={numberOfSeries}
              comparator={seriesComparator}
              onchange={(newOccurence, newComparator) => {
                setNumberOfSeries(newOccurence)
                setSeriesComparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Nombre d'instances
            </FormLabel>
            <OccurenceInput
              value={numberOfIns}
              comparator={instancesComparator}
              onchange={(newOccurence, newComparator) => {
                setNumberOfIns(newOccurence)
                setInstancesComparator(newComparator)
              }}
            />
          </BlockWrapper>

          <BlockWrapper style={{ marginBottom: '1em' }}>
            <FormLabel component="legend" className={classes.durationLegend}>
              Méthode de rattachement à un document
            </FormLabel>
            <Grid container alignItems="center">
              <Grid item xs={withDocument === DocumentAttachmentMethod.INFERENCE_TEMPOREL ? 6 : 12}>
                <Select
                  value={withDocument}
                  onChange={(event) => setWithDocument(event.target.value as DocumentAttachmentMethod)}
                  style={{ width: '100%' }}
                >
                  {withDocumentOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              {withDocument === DocumentAttachmentMethod.INFERENCE_TEMPOREL && (
                <Grid item xs={6} padding={'0 12px'}>
                  <Grid container>
                    <Grid item xs={4}>
                      <DurationUnitWrapper>Plage de </DurationUnitWrapper>
                    </Grid>
                    <Grid item xs={4}>
                      <TextFieldWrapper
                        activated={!!daysOfDelay}
                        value={daysOfDelay}
                        variant="standard"
                        size="small"
                        onChange={(event) => setDaysOfDelay(event.target.value)}
                        type="number"
                        InputProps={{
                          inputProps: {
                            min: 0
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <DurationUnitWrapper>{CalendarRequestLabel.DAY}</DurationUnitWrapper>
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </BlockWrapper>

          <FormLabel component="legend" className={classes.durationLegend}>
            Recherche par uid d'étude
          </FormLabel>
          <UidTextfield
            value={studyUid}
            onChange={setStudyUid}
            onError={(isError) => setError(isError ? Error.UID_ERROR : Error.NO_ERROR)}
          />
        </Collapse>

        {/*critères de série : */}
        <BlockWrapper style={{ marginTop: 26 }}>
          <Collapse title="Critères liés à une série" value={isSeriesUsed} margin="0">
            <BlockWrapper style={{ margin: '0 2em 1em 0' }}>
              <FormLabel component="legend" className={classes.durationLegend} style={{ padding: 0 }}>
                Date de la série
              </FormLabel>
              <CalendarRange
                inline
                value={[seriesStartDate, seriesEndDate]}
                onChange={([start, end]) => {
                  setSeriesStartDate(start || null)
                  setSeriesEndDate(end || null)
                }}
                onError={(isError) => setError(isError ? Error.INCOHERENT_AGE_ERROR : Error.NO_ERROR)}
              />
            </BlockWrapper>

            <BlockWrapper style={{ marginBottom: '1em' }}>
              <SearchbarWithCheck
                searchInput={seriesDescription}
                setSearchInput={setSeriesDescription}
                placeholder="Rechercher dans les descriptions"
                onError={(isError) => setError(isError ? Error.SEARCHINPUT_ERROR : Error.NO_ERROR)}
              />
            </BlockWrapper>

            <BlockWrapper style={{ marginBottom: '1em' }}>
              <SearchbarWithCheck
                searchInput={seriesProtocol}
                setSearchInput={setSeriesProtocol}
                placeholder="Rechercher dans les protocoles"
                onError={(isError) => setError(isError ? Error.SEARCHINPUT_ERROR : Error.NO_ERROR)}
              />
            </BlockWrapper>

            <Autocomplete
              multiple
              options={criteriaData?.data.modalities || []}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={seriesModalities}
              onChange={(e, value) => setSeriesModalities(value)}
              renderInput={(params) => <TextField {...params} label="Modalités" />}
              style={{ marginBottom: '1em' }}
            />

            <FormLabel component="legend" className={classes.durationLegend}>
              Recherche par uid de série
            </FormLabel>
            <UidTextfield
              value={seriesUid}
              onChange={setSeriesUid}
              onError={(isError) => setError(isError ? Error.UID_ERROR : Error.NO_ERROR)}
            />
          </Collapse>
        </BlockWrapper>
      </BlockWrapper>

      <AdvancedInputs
        form={CriteriaName.Imaging}
        selectedCriteria={{
          encounterService: encounterService,
          encounterStartDate: encounterStartDate,
          encounterEndDate: encounterEndDate,
          startOccurrence: startOccurrence,
          endOccurrence: endOccurrence
        }}
        onChangeValue={_onChangeValue}
      />
    </CriteriaLayout>
  )
}

export default ImagingForm
