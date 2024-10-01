import { CohortData, Cohort, ChartCode, Export, ExportCSVTable } from 'types'
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
  fetchDocumentReferenceContent,
  fetchBinary,
  fetchCheckDocumentSearchInput,
  fetchCohortInfo,
  fetchCohortAccesses
} from './callApi'

import apiBackend from '../apiBackend'
import { Binary, DocumentReference, ParametersParameter } from 'fhir/r4'
import { AxiosError, AxiosResponse, isAxiosError } from 'axios'
import { ErrorDetails, SearchInputError } from 'types/error'
import { getExtension } from 'utils/fhir'

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
          ? getAgeRepartitionMapAphp(getExtension(patientsResp.data.meta, ChartCode.AGE_PYRAMID)?.extension)
          : undefined

      const genderRepartitionMap =
        patientsResp.data.resourceType === 'Bundle'
          ? getGenderRepartitionMapAphp(getExtension(patientsResp.data.meta, ChartCode.GENDER_REPARTITION)?.extension)
          : undefined

      const monthlyVisitData =
        encountersResp.data.resourceType === 'Bundle'
          ? getVisitRepartitionMapAphp(getExtension(encountersResp.data.meta, ChartCode.MONTHLY_VISITS)?.extension)
          : undefined

      const visitTypeRepartitionData =
        encountersResp.data.resourceType === 'Bundle'
          ? getEncounterRepartitionMapAphp(
              getExtension(encountersResp.data.meta, ChartCode.VISIT_TYPE_REPARTITION)?.extension
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
