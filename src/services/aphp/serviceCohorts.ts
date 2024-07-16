import moment from 'moment'

import {
  CohortData,
  Cohort,
  AgeRepartitionType,
  GenderRepartitionType,
  ChartCode,
  DocumentsData,
  ImagingData,
  CohortImaging,
  CohortComposition,
  Export,
  ExportCSVTable
} from 'types'
import {
  getGenderRepartitionMapAphp,
  getEncounterRepartitionMapAphp,
  getAgeRepartitionMapAphp,
  getVisitRepartitionMapAphp
} from 'utils/graphUtils'
import { getApiResponseResource, getApiResponseResources } from 'utils/apiHelpers'

import {
  fetchPatient,
  fetchEncounter,
  fetchDocumentReference,
  fetchDocumentReferenceContent,
  fetchBinary,
  fetchCheckDocumentSearchInput,
  fetchCohortInfo,
  fetchCohortAccesses,
  fetchImaging
} from './callApi'

import apiBackend from '../apiBackend'
import { Binary, DocumentReference, ImagingStudy, ParametersParameter, Patient } from 'fhir/r4'
import { AxiosError, AxiosResponse, CanceledError, isAxiosError } from 'axios'
import {
  VitalStatus,
  SearchCriterias,
  PatientsFilters,
  DocumentsFilters,
  SearchByTypes,
  ImagingFilters
} from 'types/searchCriterias'
import services from '.'
import { ErrorDetails, SearchInputError } from 'types/error'
import { getResourceInfos } from 'utils/fillElement'
import { substructAgeString } from 'utils/age'

export interface IServiceCohorts {
  /**
   * Retourne les informations d'une cohorte
   *
   * Argument:
   *   - cohortId: Identifiant de la cohorte
   *
   * Retourne:
   *   - name: Nom de la cohorte
   *   - description: Description de la cohorte
   *   - cohort: Objet Cohort lié a FHIR
   *   - totalPatients: Nombre total de la cohorte
   *   - originalPatients: Liste de patients de la cohorte
   *   - genderRepartitionMap: Données liées au graphique de la répartition par genre
   *   - visitTypeRepartitionData: Données liées au graphique de la répartition des visites
   *   - agePyramidData: Données liées au graphique de la pyramide des ages
   *   - monthlyVisitData: Données liées au graphique des visites par mois
   *   - requestId: Identifiant de la requête liée à la cohorte
   *   - favorite: = true si la cohorte est une cohorte favorite
   *   - uuid: Identifiant de la cohorte liée au back-end
   */
  fetchCohort: (cohortId: string) => Promise<CohortData | undefined>

  /**
   * Retourne la liste de patients liés à une cohorte
   *
   * Argument:
   *   - page: Permet la pagination (definit un offset + limit)
   *   - searchBy: Permet la recherche sur un champs précis (_text, family, given, identifier)
   *   - searchInput: Permet la recherche textuelle
   *   - gender: Permet le filtre par genre
   *   - birthdates: Permet le filtre par date de naissance
   *   - vitalStatus: Permet le filtre par statut vital
   *   - sortBy: Permet le tri
   *   - sortDirection: Permet le tri dans l'ordre croissant ou décroissant
   *   - deidentified: savoir si la liste de patients est pseudonymisée ou non
   *   - groupId: (optionnel) Périmètre auquel la cohorte est liée
   *   - includeFacets: = true si vous voulez inclure les graphique
   *   - signal: (optionnel) paramètre permettant d'identifier si une requête est déjà en cours et de l'annuler si besoin
   *
   * Retourne:
   *   - totalPatients: Nombre de patients (dépend des filtres)
   *   - originalPatients: Liste de patients
   *   - agePyramidData: Données liées au graphique de la pyramide des ages
   *   - genderRepartitionMap: Données liées au graphique de la répartition par genre
   */
  fetchPatientList: (
    options: {
      page: number
      searchCriterias: SearchCriterias<PatientsFilters | null>
    },
    deidentified: boolean,
    groupId?: string,
    includeFacets?: boolean,
    signal?: AbortSignal
  ) => Promise<
    | {
        totalPatients: number
        originalPatients: Patient[] | undefined
        agePyramidData?: AgeRepartitionType
        genderRepartitionMap?: GenderRepartitionType
      }
    | undefined
  >

  /**
   * Retourne la liste de documents liés à une cohorte
   *
   * Argument:
   *   - deidentifiedBoolean: = true si la cohorte est pseudo. (permet un traitement particulier des éléments)
   *   - searchBy: Détermine si l'on recherche par contenu ou titre du document
   *   - sortBy: Permet le tri
   *   - sortDirection: Permet le tri dans l'ordre croissant ou décroissant
   *   - page: Permet la pagination (definit un offset + limit)
   *   - searchInput: Permet la recherche textuelle
   *   - selectedDocTypes: Permet de filtrer sur le type de documents
   *   - nda: Permet de filtrer les documents sur un NDA particulier (uniquement en nominatif)
   *   - onlyPdfAvailable: permet d'afficher ou non seulement les documents dont le PDF est disponible
   *   - startDate: Permet de filtrer sur une date
   *   - endDate: Permet de filtrer sur une date
   *   - groupId: (optionnel) Périmètre auquel la cohorte est liée
   *   - signal: (optionnel) paramètre permettant d'identifier si une requête est déjà en cours et de l'annuler si besoin
   */

  fetchDocuments: (
    options: {
      deidentified: boolean
      page: number
      searchCriterias: SearchCriterias<DocumentsFilters>
    },
    groupId?: string,
    signal?: AbortSignal
  ) => Promise<DocumentsData> | Promise<SearchInputError>

  /**
   * Retourne la liste d'objets d'Imagerie liés à une cohorte
   */

  fetchImagingList: (
    options: {
      deidentified: boolean
      page: number
      searchCriterias: SearchCriterias<ImagingFilters>
    },
    groupId?: string,
    signal?: AbortSignal
  ) => Promise<ImagingData>

  /**
   * Permet de vérifier si le champ de recherche textuelle est correct
   *
   * Argument:
   *   - searchInput: champ de recherche textuelle
   *
   * Retourne:
   *   - searchInputError: objet décrivant la ou les erreurs du champ de recherche s'il y en a
   */
  checkDocumentSearchInput: (searchInput: string, signal?: AbortSignal) => Promise<SearchInputError>

  /**
   * Permet de récupérer le contenu d'un document
   *
   * Argument:
   *   - compositionId: Identifiant du document
   *
   * Retourne:
   *   - IComposition_Section: Contenu du document
   */
  fetchDocumentContent: (compositionId: string) => Promise<DocumentReference | undefined>

  /**
   * Permet de récupérer le contenu d'un document (/Binary)
   *
   * Argument:
   *   - documentId: Identifiant du document
   *
   * Retourne:
   *   - IComposition_Section: Contenu du document
   */
  fetchBinary: (documentId: string) => Promise<Binary | undefined>

  /**
   * Permet la récupération des droits liés à plusieurs cohortes
   *
   * Argument:
   *   - cohorts: Tableau de cohortes de type `Cohort[]`
   *
   * Retourne:
   *   - La liste de cohortes avec une extension liée au droit d'accès + export
   */
  fetchCohortsRights: (cohorts: Cohort[]) => Promise<Cohort[]>

  /**
   * Permet de créer une demande d'export d'une cohorte
   *
   * Argument:
   *   - cohortId: Identifiant de la cohorte
   *   - motivation: Raison de l'export
   *   - tables: Liste de tables demandées dans l'export
   */
  createExport: (args: {
    cohortId: string
    motivation: string
    tables: ExportCSVTable[]
    outputFormat: 'csv' | 'xlsx'
    group_tables: boolean
  }) => Promise<AxiosResponse<Export> | AxiosError>
}

const servicesCohorts: IServiceCohorts = {
  fetchCohort: async (cohortId) => {
    try {
      const fetchCohortsResults = await Promise.all([
        fetchCohortInfo(cohortId),
        fetchPatient({
          pivotFacet: ['age-month_gender', 'deceased_gender'],
          _list: [cohortId],
          size: 20,
          _sort: 'family',
          _elements: ['gender', 'name', 'birthDate', 'deceased', 'identifier', 'extension']
        }),
        fetchEncounter({
          facet: ['class', 'visit-year-month-gender-facet'],
          _list: [cohortId],
          size: 0,
          visit: true
        })
      ])

      const cohortInfo = fetchCohortsResults[0]
      const patientsResp = fetchCohortsResults[1]
      const encountersResp = fetchCohortsResults[2]

      let name = ''
      let description = ''
      let requestId = ''
      let snapshotId = ''
      let uuid = ''
      let favorite = false

      if (cohortInfo.data.results && cohortInfo.data.results.length >= 1) {
        name = cohortInfo.data.results[0].name ?? ''
        description = cohortInfo.data.results[0].description ?? ''
        requestId = cohortInfo.data.results[0].request ?? ''
        snapshotId = cohortInfo.data.results[0].request_query_snapshot ?? ''
        favorite = cohortInfo.data.results[0].favorite ?? false
        uuid = cohortInfo.data.results[0].uuid ?? ''
      } else {
        throw new Error('This cohort is not yours or invalid')
      }

      const totalPatients = patientsResp.data.resourceType === 'Bundle' ? patientsResp.data.total : 0

      const originalPatients = getApiResponseResources(patientsResp)

      const agePyramidData =
        patientsResp.data.resourceType === 'Bundle'
          ? getAgeRepartitionMapAphp(
              patientsResp.data.meta?.extension?.find((facet) => facet.url === ChartCode.AGE_PYRAMID)?.extension
            )
          : undefined

      const genderRepartitionMap =
        patientsResp.data.resourceType === 'Bundle'
          ? getGenderRepartitionMapAphp(
              patientsResp.data.meta?.extension?.find((facet) => facet.url === ChartCode.GENDER_REPARTITION)?.extension
            )
          : undefined

      const monthlyVisitData =
        encountersResp.data.resourceType === 'Bundle'
          ? getVisitRepartitionMapAphp(
              encountersResp.data.meta?.extension?.find((facet) => facet.url === ChartCode.MONTHLY_VISITS)?.extension
            )
          : undefined

      const visitTypeRepartitionData =
        encountersResp.data.resourceType === 'Bundle'
          ? getEncounterRepartitionMapAphp(
              encountersResp.data.meta?.extension?.find((facet) => facet.url === ChartCode.VISIT_TYPE_REPARTITION)
                ?.extension
            )
          : undefined

      return {
        name,
        description,
        totalPatients,
        originalPatients,
        genderRepartitionMap,
        visitTypeRepartitionData,
        agePyramidData,
        monthlyVisitData,
        requestId,
        snapshotId,
        favorite,
        uuid
      }
    } catch (error) {
      return {
        name: '',
        description: '',
        cohort: undefined,
        totalPatients: undefined,
        originalPatients: [],
        genderRepartitionMap: undefined,
        visitTypeRepartitionData: undefined,
        monthlyVisitData: undefined,
        agePyramidData: undefined,
        requestId: '',
        snapshotId: '',
        favorite: false,
        uuid: ''
      }
    }
  },

  fetchPatientList: async (
    { page, searchCriterias: { orderBy, searchBy, searchInput, filters } },
    deidentified,
    groupId,
    includeFacets,
    signal
  ) => {
    try {
      // convert birthdates into days or months depending of if it's a deidentified perimeter or not
      const birthdates: [string, string] = [
        moment(substructAgeString(filters?.birthdatesRanges?.[0] || '')).format('MM/DD/YYYY'),
        moment(substructAgeString(filters?.birthdatesRanges?.[1] || '')).format('MM/DD/YYYY')
      ]
      const minBirthdate =
        birthdates && Math.abs(moment(birthdates[0]).diff(moment(), deidentified ? 'months' : 'days'))
      const maxBirthdate =
        birthdates && Math.abs(moment(birthdates[1]).diff(moment(), deidentified ? 'months' : 'days'))
      const patientsResp = await fetchPatient({
        size: 20,
        offset: page ? (page - 1) * 20 : 0,
        _sort: orderBy.orderBy,
        sortDirection: orderBy.orderDirection,
        pivotFacet: includeFacets ? ['age-month_gender', 'deceased_gender'] : [],
        _list: groupId ? [groupId] : [],
        gender: filters && filters.genders.join(','),
        searchBy,
        _text: searchInput.trim(),
        minBirthdate: minBirthdate,
        maxBirthdate: maxBirthdate,
        deceased:
          filters && filters.vitalStatuses && filters.vitalStatuses.length === 1
            ? filters.vitalStatuses.includes(VitalStatus.DECEASED)
              ? true
              : false
            : undefined,
        deidentified: deidentified,
        signal: signal,
        _elements: ['gender', 'name', 'birthDate', 'deceased', 'identifier', 'extension']
      })

      const totalPatients = patientsResp.data.resourceType === 'Bundle' ? patientsResp.data.total : 0

      const originalPatients = getApiResponseResources(patientsResp)

      const agePyramidData =
        patientsResp.data.resourceType === 'Bundle'
          ? getAgeRepartitionMapAphp(
              patientsResp.data.meta?.extension?.find((facet) => facet.url === ChartCode.AGE_PYRAMID)?.extension
            )
          : undefined

      const genderRepartitionMap =
        patientsResp.data.resourceType === 'Bundle'
          ? getGenderRepartitionMapAphp(
              patientsResp.data.meta?.extension?.find((facet) => facet.url === ChartCode.GENDER_REPARTITION)?.extension
            )
          : undefined

      return {
        totalPatients: totalPatients ?? 0,
        originalPatients,
        genderRepartitionMap,
        agePyramidData
      }
    } catch (error) {
      console.error(error)
      if (error instanceof CanceledError) {
        throw error
      }
    }
  },

  fetchImagingList: async (options, groupId, signal) => {
    const {
      deidentified,
      page,
      searchCriterias: {
        orderBy,
        searchInput,
        filters: { ipp, nda, startDate, endDate, executiveUnits, modality, encounterStatus }
      }
    } = options
    try {
      const [imagingResponse, allImagingResponse] = await Promise.all([
        fetchImaging({
          size: 20,
          offset: page ? (page - 1) * 20 : 0,
          order: orderBy.orderBy,
          orderDirection: orderBy.orderDirection,
          _text: searchInput,
          encounter: nda,
          ipp,
          minDate: startDate ?? '',
          maxDate: endDate ?? '',
          _list: groupId ? [groupId] : [],
          signal,
          modalities: modality.map(({ id }) => id),
          executiveUnits: executiveUnits.map((unit) => unit.id),
          encounterStatus: encounterStatus.map(({ id }) => id)
        }),
        !!searchInput || !!ipp || !!nda || !!startDate || !!endDate || executiveUnits.length > 0 || modality.length > 0
          ? fetchImaging({
              size: 0,
              _list: groupId ? [groupId] : [],
              signal: signal
            })
          : null
      ])

      const imagingList = getApiResponseResources(imagingResponse) ?? []
      const completeImagingList = await getResourceInfos<ImagingStudy, CohortImaging>(
        imagingList,
        deidentified,
        groupId,
        signal
      )

      const totalImaging = imagingResponse.data?.resourceType === 'Bundle' ? imagingResponse.data?.total : 0
      const totalAllImaging =
        allImagingResponse !== null
          ? allImagingResponse.data?.resourceType === 'Bundle'
            ? allImagingResponse.data.total
            : totalImaging
          : totalImaging
      return {
        totalImaging: totalImaging ?? 0,
        totalAllImaging: totalAllImaging ?? 0,
        imagingList: completeImagingList ?? []
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la liste d'imagerie :", error)
      return {
        totalImaging: 0,
        totalAllImaging: 0,
        imagingList: []
      }
    }
  },

  fetchDocuments: async (options, groupId, signal) => {
    const {
      deidentified,
      page,
      searchCriterias: {
        orderBy,
        searchInput,
        searchBy,
        filters: {
          docStatuses,
          docTypes,
          endDate,
          executiveUnits,
          ipp,
          nda,
          onlyPdfAvailable,
          startDate,
          encounterStatus
        }
      }
    } = options
    if (searchInput) {
      const searchInputError = await services.cohorts.checkDocumentSearchInput(searchInput, signal)
      if (searchInputError && searchInputError.isError) {
        throw searchInputError
      }
    }
    const [docsList, allDocsList] = await Promise.all([
      fetchDocumentReference({
        size: 20,
        offset: page ? (page - 1) * 20 : 0,
        searchBy: searchBy,
        _sort: orderBy.orderBy,
        sortDirection: orderBy.orderDirection,
        docStatuses: docStatuses,
        _elements: searchInput ? [] : undefined,
        _list: groupId ? [groupId] : [],
        _text: searchInput,
        highlight_search_results: searchBy === SearchByTypes.TEXT ? true : false,
        type:
          docTypes.map((docType) => docType.code).length > 0 ? docTypes.map((docType) => docType.code).join(',') : '',
        'encounter-identifier': nda,
        'patient-identifier': ipp,
        onlyPdfAvailable: onlyPdfAvailable,
        signal: signal,
        minDate: startDate ?? '',
        maxDate: endDate ?? '',
        uniqueFacet: ['subject'],
        executiveUnits: executiveUnits.map((eu) => eu.id),
        encounterStatus: encounterStatus.map(({ id }) => id)
      }),
      !!searchInput ||
      docTypes.length > 0 ||
      !!nda ||
      !!ipp ||
      !!startDate ||
      !!endDate ||
      executiveUnits.length > 0 ||
      docStatuses.length > 0 ||
      !!onlyPdfAvailable ||
      encounterStatus.length > 0
        ? fetchDocumentReference({
            signal: signal,
            _list: groupId ? [groupId] : [],
            size: 0,
            uniqueFacet: ['subject']
          })
        : null
    ])

    const totalDocs = docsList?.data?.resourceType === 'Bundle' ? docsList.data.total : 0
    const totalAllDocs =
      allDocsList !== null ? (allDocsList?.data?.resourceType === 'Bundle' ? allDocsList.data.total : 0) : totalDocs

    const totalPatientDocs =
      docsList?.data?.resourceType === 'Bundle'
        ? (
            docsList?.data?.meta?.extension?.find((extension) => extension.url === 'unique-subject') || {
              valueDecimal: 0
            }
          ).valueDecimal
        : 0
    const totalAllPatientDocs =
      allDocsList !== null
        ? (
            allDocsList?.data?.meta?.extension?.find((extension) => extension.url === 'unique-subject') || {
              valueDecimal: 0
            }
          ).valueDecimal
        : totalPatientDocs

    const documentsList = getApiResponseResources(docsList) ?? []
    const filledDocumentsList = await getResourceInfos<DocumentReference, CohortComposition>(
      documentsList,
      deidentified,
      groupId,
      signal
    )

    return {
      totalDocs: totalDocs ?? 0,
      totalAllDocs: totalAllDocs ?? 0,
      totalPatientDocs: totalPatientDocs ?? 0,
      totalAllPatientDocs: totalAllPatientDocs ?? 0,
      documentsList: filledDocumentsList ?? []
    }
  },

  checkDocumentSearchInput: async (searchInput, signal) => {
    if (!searchInput) {
      return {
        isError: false
      }
    }

    const checkDocumentSearchInput = await fetchCheckDocumentSearchInput(searchInput, signal)

    if (checkDocumentSearchInput) {
      const errors = checkDocumentSearchInput.find((parameter) => parameter.name === 'WARNING')?.part ?? []

      const parsedErrors: ErrorDetails[] = []

      errors.forEach((error: ParametersParameter) => {
        try {
          if (error.valueString) {
            const splitError = error.valueString.split(';')

            const errorPositions = splitError.find((errorPart) => errorPart.includes('Positions'))

            const cleanedErrorPositions = errorPositions
              ? errorPositions
                  .replaceAll(' ', '')
                  .replace('Positions:', '')
                  .split('char:')
                  .slice(1)
                  .map((el) => parseInt(el))
              : []

            const errorSolution = splitError.find((errorPart) => errorPart.includes('Solution'))
            const cleanedErrorSolution = errorSolution ? errorSolution.replace(' Solution: ', '') : ''

            const errorObject = {
              errorName: error.name,
              errorPositions: cleanedErrorPositions,
              errorSolution: cleanedErrorSolution
            }

            parsedErrors.push(errorObject)
          }
        } catch (e) {
          console.error('failed to parse int', e)
        }
      })

      return {
        isError: checkDocumentSearchInput.find((parameter) => parameter.name === 'VALIDÉ') ? false : true,
        errorsDetails: parsedErrors
      }
    } else {
      return {
        isError: true,
        errorsDetails: [
          {
            errorName: 'Erreur du serveur',
            errorSolution: 'Veuillez refaire votre recherche'
          }
        ]
      }
    }
  },

  fetchDocumentContent: async (compositionId) => {
    const documentContent = await fetchDocumentReferenceContent(compositionId)
    return getApiResponseResource(documentContent)
  },

  fetchBinary: async (documentId) => {
    const documentBinaryResponse = await fetchBinary({ _id: documentId })
    const documentBinaries = getApiResponseResources(documentBinaryResponse)
    return documentBinaries && documentBinaries.length > 0 ? documentBinaries[0] : undefined
  },

  fetchCohortsRights: async (cohorts): Promise<Cohort[]> => {
    try {
      const ids = cohorts
        .map((cohort) => cohort.group_id)
        .filter((id) => id !== undefined || id !== '')
        .filter((i): i is string => i !== '')
      if (ids.length === 0) return []
      const rightsResponse = await fetchCohortAccesses(ids)
      return cohorts.map((cohort) => {
        return {
          ...cohort,
          rights: rightsResponse.data.find((right) => right.cohort_id == cohort.group_id)?.rights
        }
      })
    } catch (error) {
      console.error('Error (fetchCohortsRights) :', error)
      return []
    }
  },

  createExport: async (args): Promise<AxiosResponse<Export> | AxiosError> => {
    try {
      const { cohortId, motivation, tables, outputFormat, group_tables } = args

      return await apiBackend.post<Export>('/exports/', {
        motivation,
        export_tables: tables.map((table: ExportCSVTable) => ({
          table_ids: table.id,
          cohort_result_source: cohortId,
          respect_table_relationships: table.respect_table_relationships,
          ...(table.fhir_filter && { fhir_filter: table.fhir_filter?.uuid })
        })),
        nominative: true, // Nominative should always be true when exporting a CSV (see issue #1113)
        output_format: outputFormat,
        group_tables: group_tables
      })
    } catch (error) {
      if (isAxiosError(error)) return error
      else throw error
    }
  }
}

export default servicesCohorts
