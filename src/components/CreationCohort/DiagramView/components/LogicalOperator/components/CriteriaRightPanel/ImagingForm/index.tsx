import React, { useEffect, useState } from 'react'
import { Autocomplete, FormLabel, Grid, MenuItem, Select, TextField } from '@mui/material'
import { BlockWrapper } from 'components/ui/Layout'
import CalendarRange from 'components/ui/Inputs/CalendarRange'
import Collapse from 'components/ui/Collapse'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { DurationUnitWrapper } from 'components/ui/Inputs/DurationRange/styles'
import { TextFieldWrapper } from 'components/ui/Inputs/DurationRange/styles'
import OccurenceInput from 'components/ui/Inputs/Occurences'
import CriteriaLayout from '../CriteriaLayout'
import AdvancedInputs from '../AdvancedInputs/AdvancedInputs'

import { CriteriaDrawerComponentProps, CriteriaName, LoadingStatus } from 'types'
import { CalendarRequestLabel } from 'types/dates'
import { Comparators, CriteriaDataKey, RessourceType } from 'types/requestCriterias'
import { DocumentAttachmentMethod, DocumentAttachmentMethodLabel, LabelObject } from 'types/searchCriterias'
import useStyles from './styles'
import { mappingCriteria } from '../DemographicForm'
import SearchbarWithCheck from 'components/ui/Inputs/SearchbarWithCheck'
import { SearchInputError } from 'types/error'

enum Error {
  EMPTY_FORM,
  INCOHERENT_AGE_ERROR,
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

  const { criteria, selectedCriteria, onChangeSelectedCriteria, goBack } = props
  const [title, setTitle] = useState(selectedCriteria?.title || "Critère d'Imagerie")
  const [occurrence, setOccurrence] = useState<number>(selectedCriteria?.occurrence || 1)
  const [occurrenceComparator, setOccurrenceComparator] = useState<Comparators>(
    selectedCriteria?.occurrenceComparator || Comparators.GREATER_OR_EQUAL
  )
  const [isInclusive, setIsInclusive] = useState(selectedCriteria?.isInclusive || true)
  const [studyStartDate, setStudyStartDate] = useState<string | null>(selectedCriteria?.studyStartDate || null)
  const [studyEndDate, setStudyEndDate] = useState<string | null>(selectedCriteria?.studyEndDate || null)
  const [studyModalities, setStudyModalities] = useState<LabelObject[]>(
    mappingCriteria(selectedCriteria?.studyModalities, CriteriaDataKey.MODALITIES, criteria) || []
  )
  const [studyDescription, setStudyDescription] = useState<string>(selectedCriteria?.studyDescription || '')
  const [studyDescriptionError, setStudyDescriptionError] = useState<SearchInputError | undefined>(undefined)
  const [studyProcedure, setStudyProcedure] = useState<string>(selectedCriteria?.studyProcedure || '')
  const [studyProcedureError, setStudyProcedureError] = useState<SearchInputError | undefined>(undefined)
  const [numberOfSeries, setNumberOfSeries] = useState<number>(selectedCriteria?.numberOfSeries || 1)
  const [seriesComparator, setSeriesComparator] = useState<Comparators>(
    selectedCriteria?.seriesComparator || Comparators.GREATER_OR_EQUAL
  )
  const [numberOfIns, setNumberOfIns] = useState<number>(selectedCriteria?.numberOfIns || 1)
  const [instancesComparator, setInstancesComparator] = useState<Comparators>(
    selectedCriteria?.instancesComparator || Comparators.GREATER_OR_EQUAL
  )
  const [withDocument, setWithDocument] = useState<string>(
    selectedCriteria?.withDocument || DocumentAttachmentMethod.NONE
  )
  const [daysOfDelay, setDaysOfDelay] = useState<string | null>(selectedCriteria?.daysOfDelay || null)
  const [studyUid, setStudyUid] = useState<string>(selectedCriteria?.studyUid || '')
  const isEdition = selectedCriteria !== null ? true : false

  const [seriesStartDate, setSeriesStartDate] = useState<string | null>(selectedCriteria?.seriesStartDate || null)
  const [seriesEndDate, setSeriesEndDate] = useState<string | null>(selectedCriteria?.seriesEndDate || null)
  const [seriesDescription, setSeriesDescription] = useState<string>(selectedCriteria?.seriesDescription || '')
  const [seriesDescriptionError, setSeriesDescriptionError] = useState<SearchInputError | undefined>(undefined)
  const [seriesProtocol, setSeriesProtocol] = useState<string>(selectedCriteria?.seriesProtocol || '')
  const [seriesProtocolError, setSeriesProtocolError] = useState<SearchInputError | undefined>(undefined)
  const [seriesModalities, setSeriesModalities] = useState<LabelObject[]>(
    mappingCriteria(selectedCriteria?.seriesModalities, CriteriaDataKey.MODALITIES, criteria) || []
  )
  const [bodySite, setBodySite] = useState<string>(selectedCriteria?.bodySite || '')
  const [bodySiteError, setBodySiteError] = useState<SearchInputError | undefined>(undefined)
  const [seriesUid, setSeriesUid] = useState(selectedCriteria?.seriesUid || '')
  const [encounterService, setEncounterService] = useState(selectedCriteria?.encounterService || [])
  const [encounterStartDate, setEncounterStartDate] = useState(selectedCriteria?.encounterStartDate || null)
  const [encounterEndDate, setEncounterEndDate] = useState(selectedCriteria?.encounterEndDate || null)
  const [startOccurrence, setStartOccurence] = useState(selectedCriteria?.startOccurrence || null)
  const [endOccurrence, setEndOccurence] = useState(selectedCriteria?.endOccurrence || null)

  const [error, setError] = useState(Error.NO_ERROR)
  const [searchCheckingLoading, setSearchCheckingLoading] = useState(LoadingStatus.SUCCESS)

  const _onChangeValue = (key: string, value: any) => {
    console.log('key', key)
    console.log('value', value)
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

  useEffect(() => {
    setError(Error.NO_ERROR)
    // if (studyDate[0] === null && studyDate[1] === null && seriesDate[0] === null && seriesDate[1] === null) {
    //   setError(Error.EMPTY_FORM)
    // }
  }, [
    studyStartDate,
    studyEndDate,
    studyModalities,
    numberOfSeries,
    numberOfIns,
    seriesStartDate,
    seriesEndDate,
    seriesDescription,
    seriesProtocol,
    seriesModalities
  ])

  const onSubmit = () => {
    onChangeSelectedCriteria({
      id: selectedCriteria?.id,
      type: RessourceType.IMAGING,
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
      bodySite,
      seriesUid,
      encounterService,
      encounterStartDate,
      encounterEndDate,
      startOccurrence,
      endOccurrence
    })
  }

  return (
    <CriteriaLayout
      title={title}
      onChangeTitle={setTitle}
      isEdition={isEdition}
      goBack={goBack}
      onSubmit={onSubmit}
      disabled={false}
      isInclusive={isInclusive}
      onChangeIsInclusive={setIsInclusive}
    >
      {/* Nombre d'occurences */}
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

      {/* study :         */}
      <BlockWrapper margin="1em">
        <Collapse title="Critères liés à une étude">
          {/* Date => started */}
          <FormLabel component="legend" className={classes.durationLegend}>
            Date de l'étude
          </FormLabel>
          <CalendarRange
            inline
            value={[studyStartDate, studyEndDate]}
            onChange={([start, end]) => {
              setStudyStartDate(start)
              setStudyEndDate(end)
            }}
            onError={(isError) => setError(isError ? Error.INCOHERENT_AGE_ERROR : Error.NO_ERROR)}
          />

          {/* Modalité (des series associées à cette study) (référentiel : afficher "code - nom") (liste multiselect) => modality */}
          <Autocomplete
            multiple
            options={criteria?.data.modalities || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={studyModalities}
            onChange={(e, value) => setStudyModalities(value)}
            renderInput={(params) => <TextField {...params} label="Modalité" />}
          />

          {/* Description (champ text libre) => description */}
          <SearchbarWithCheck
            searchInput={studyDescription}
            setSearchInput={setStudyDescription}
            placeholder="Rechercher dans les descriptions"
            loading={searchCheckingLoading}
            setLoading={setSearchCheckingLoading}
            searchInputError={studyDescriptionError}
            setSearchInputError={setStudyDescriptionError}
          />

          {/* Procédure (champ text libre) => procedureCode */}
          <SearchbarWithCheck
            searchInput={studyProcedure}
            setSearchInput={setStudyProcedure}
            placeholder="Rechercher dans les procédures"
            loading={searchCheckingLoading}
            setLoading={setSearchCheckingLoading}
            searchInputError={studyProcedureError}
            setSearchInputError={setStudyProcedureError}
          />

          {/* Nombre de series (>=0) => numberOfSeries */}
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

          {/* Nombre d'instances (>=0) => numberOfIns */}
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

          {/* Rattaché à un document (oui/non et méthodologie de rattachement (liste à choix multiples (référentiel) - null=pas de rattachement)) => with-document */}
          <FormLabel component="legend" className={classes.durationLegend}>
            Méthode de rattachement à un document
          </FormLabel>
          <Select value={withDocument} onChange={(event) => setWithDocument(event.target.value)}>
            {withDocumentOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {withDocument === DocumentAttachmentMethod.INFERENCE_TEMPOREL && (
            <Grid container>
              <Grid item xs={6}>
                <TextFieldWrapper
                  value={daysOfDelay}
                  variant="standard"
                  size="small"
                  onChange={(event) => setDaysOfDelay(event.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <DurationUnitWrapper>{CalendarRequestLabel.DAY}</DurationUnitWrapper>
              </Grid>
            </Grid>
          )}

          {/* Recherche par uid */}
          <TextField
            label=""
            placeholder="Ajouter une liste d'uid"
            value={studyUid}
            variant="outlined"
            onChange={(event) => setStudyUid(event.target.value)}
            multiline
            minRows={5}
            style={{ width: '100%' }}
          />
        </Collapse>

        {/* série : */}
        {/* Date (si pas cher à faire) => series-started */}
        <Collapse title="Critères liés à une série" value={false}>
          <FormLabel component="legend" className={classes.durationLegend}>
            Date de la série
          </FormLabel>
          <CalendarRange
            inline
            value={[seriesStartDate, seriesEndDate]}
            onChange={([start, end]) => {
              setSeriesStartDate(start)
              setSeriesEndDate(end)
            }}
            onError={(isError) => setError(isError ? Error.INCOHERENT_AGE_ERROR : Error.NO_ERROR)}
          />

          {/* Description (champ texte libre) => series-descr */}
          <SearchbarWithCheck
            searchInput={seriesDescription}
            setSearchInput={setSeriesDescription}
            placeholder="Rechercher dans les descriptions"
            loading={searchCheckingLoading}
            setLoading={setSearchCheckingLoading}
            searchInputError={seriesDescriptionError}
            setSearchInputError={setSeriesDescriptionError}
          />

          {/* Protocole (champ texte libre) => series-protocol */}
          <SearchbarWithCheck
            searchInput={seriesProtocol}
            setSearchInput={setSeriesProtocol}
            placeholder="Rechercher dans les protocoles"
            loading={searchCheckingLoading}
            setLoading={setSearchCheckingLoading}
            searchInputError={seriesProtocolError}
            setSearchInputError={setSeriesProtocolError}
          />

          {/* Modalité (référentiel sous forme de liste ~ 40 items) : afficher "code - nom" => series-modality */}
          <Autocomplete
            multiple
            options={criteria?.data.modalities || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={seriesModalities}
            onChange={(e, value) => setSeriesModalities(value)}
            renderInput={(params) => <TextField {...params} label="Modalité" />}
          />

          {/* Partie du corps (champ texte libre) => bodysite */}
          <SearchbarWithCheck
            searchInput={bodySite}
            setSearchInput={setBodySite}
            placeholder="Rechercher dans les parties du corps"
            loading={searchCheckingLoading}
            setLoading={setSearchCheckingLoading}
            searchInputError={bodySiteError}
            setSearchInputError={setBodySiteError}
          />

          {/* Recherche par uid */}
          <TextField
            label=""
            placeholder="Ajouter une liste d'uid"
            variant="outlined"
            value={seriesUid}
            onChange={(event) => setSeriesUid(event.target.value)}
            multiline
            minRows={5}
            style={{ width: '100%' }}
          />
        </Collapse>
      </BlockWrapper>

      {/* Recherche avancée */}
      <AdvancedInputs form={CriteriaName.Imaging} selectedCriteria={selectedCriteria} onChangeValue={_onChangeValue} />
    </CriteriaLayout>
  )
}

export default ImagingForm
