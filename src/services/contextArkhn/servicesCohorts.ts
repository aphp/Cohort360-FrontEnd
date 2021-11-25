import moment from 'moment'

import {
  CohortComposition,
  CohortData,
  SearchByTypes,
  VitalStatus,
  Back_API_Response,
  Cohort,
  AgeRepartitionType,
  GenderRepartitionType
} from 'types'
import {
  IPatient,
  IComposition,
  IComposition_Section,
  PatientGenderKind,
  IIdentifier
} from '@ahryman40k/ts-fhir-types/lib/R4'
import {
  getGenderRepartitionMapAphp,
  getEncounterRepartitionMapAphp,
  getAgeRepartitionMapAphp,
  getVisitRepartitionMapAphp
} from 'utils/graphUtils'
import { getApiResponseResources } from 'utils/apiHelpers'

import { fetchGroup, fetchPatient, fetchEncounter, fetchComposition, fetchCompositionContent } from './callApi'

import apiBackend from '../apiBackend'
import apiPortail from '../apiPortail'

export interface IServicesCohorts {
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
   *   - genderRepartitionMap: Données lié au graphique de la répartition par genre
   *   - visitTypeRepartitionData: Données lié au graphique de la répartition des visites
   *   - agePyramidData: Données lié au graphique de la pyramide des ages
   *   - monthlyVisitData: Données lié au graphique des visites par mois
   *   - requestId: Identifiant de la requete lié à la cohorte
   *   - favorite: = true si la cohorte est une cohorte favorite
   *   - uuid: Identifiant de la cohorte lié au back-end
   */
  fetchCohort: (cohortId: string) => Promise<CohortData | undefined>

  /**
   * Retourne la liste de patient lié à une cohorte
   *
   * Argument:
   *   - page: Permet la pagination (definie un offset + limit)
   *   - searchBy: Permet la recherche sur un champs précis (_text, family, given, identifier)
   *   - searchInput: Permet la recherche textuelle
   *   - gender: Permet le filtre par genre
   *   - age: Permet le filtre par age
   *   - vitalStatus: Permet le filtre par status vital
   *   - sortBy: Permet le tri
   *   - sortDirection: Permet le tri dans l'ordre croissant ou décroissant
   *   - groupId: (optionnel) Périmètre auquel la cohorte est lié
   *   - includeFacets: = true si vous voulez inclure les graphique
   *
   * Retourne:
   *   - totalPatients: Nombre de patient (dépend des filtres)
   *   - originalPatients: Liste de patients
   *   - agePyramidData: Données lié au graphique de la pyramide des ages
   *   - genderRepartitionMap: Données lié au graphique de la répartition par genre
   */
  fetchPatientList: (
    page: number,
    searchBy: SearchByTypes,
    searchInput: string,
    gender: PatientGenderKind,
    age: [number, number],
    vitalStatus: VitalStatus,
    sortBy: string,
    sortDirection: string,
    groupId?: string,
    includeFacets?: boolean
  ) => Promise<
    | {
        totalPatients: number
        originalPatients: IPatient[] | undefined
        agePyramidData?: AgeRepartitionType
        genderRepartitionMap?: GenderRepartitionType
      }
    | undefined
  >

  /**
   * Retourne la liste de documents lié à une cohorte
   *
   * Argument:
   *   - deidentifiedBoolean: = true si la cohorte est pseudo. (permet un traitement particulié des éléments)
   *   - sortBy: Permet le tri
   *   - sortDirection: Permet le tri dans l'ordre croissant ou décroissant
   *   - page: Permet la pagination (definie un offset + limit)
   *   - searchInput: Permet la recherche textuelle
   *   - selectedDocTypes: Permet de filtrer sur le type de documents
   *   - nda: Permet de filtrer les documents sur un NDA particulié (uniquement en nominatif)
   *   - startDate: Permet de filtrer sur une date
   *   - endDate: Permet de filtrer sur une date
   *   - groupId: (optionnel) Périmètre auquel la cohorte est lié
   */
  fetchDocuments: (
    deidentifiedBoolean: boolean,
    sortBy: string,
    sortDirection: string,
    page: number,
    searchInput: string,
    selectedDocTypes: string[],
    nda: string,
    startDate?: string | null,
    endDate?: string | null,
    groupId?: string
  ) => Promise<{
    totalDocs: number
    totalAllDocs: number
    documentsList: IComposition[]
  }>

  /**
   * Permet de récupérer le contenue d'un document
   *
   * Argument:
   *   - compositionId: Identifiant du documents
   *
   * Retoune:
   *   - IComposition_Section: Contenue du document
   */
  fetchDocumentContent: (compositionId: string) => Promise<IComposition_Section[]>

  /**
   * Permet la récupération des droits d'export lié a une cohorte
   *
   * Argument:
   *   - cohortId: Identifiant de la cohorte
   *   - providerId: Identifiant technique du practitioner
   *
   * Retoune:
   *   - Si un utilisateur peut faire une demande d'export sur la cohorte
   */
  fetchCohortExportRight: (cohortId: string, providerId?: string) => Promise<boolean>

  /**
   * Permet de créer une demande d'export d'une cohorte
   *
   * Argument:
   *   - cohortId: Identifiant de la cohorte
   *   - motivation: Raison de l'export
   *   - tables: Liste de table demandé dans l'export
   *   - output_format: Format de l'export ('csv' ou 'jupiter', par défaut = 'csv')
   */
  createExport: (args: {
    cohortId: number
    motivation: string
    tables: string[]
    output_format?: string
  }) => Promise<any>
}

const servicesCohorts: IServicesCohorts = {
  fetchCohort: async (cohortId) => {
    // eslint-disable-next-line
    let fetchCohortsResults = await Promise.all([
      apiBackend.get<Back_API_Response<Cohort>>(`/explorations/cohorts/?fhir_group_id=${cohortId}`),
      fetchGroup({ _id: cohortId }),
      fetchPatient({
        pivotFacet: ['age_gender', 'deceased_gender'],
        _list: [cohortId],
        size: 20,
        _sort: 'given',
        _elements: ['gender', 'name', 'birthDate', 'deceased', 'identifier', 'extension']
      }),
      fetchEncounter({
        facet: ['class', 'visit-year-month-gender-facet'],
        _list: [cohortId],
        size: 0,
        type: 'VISIT'
      })
    ])

    const cohortInfo = fetchCohortsResults[0]
    const cohortResp = fetchCohortsResults[1]
    const patientsResp = fetchCohortsResults[2]
    const encountersResp = fetchCohortsResults[3]

    let name = ''
    let description = ''
    let requestId = ''
    let uuid = ''
    let favorite = false

    if (cohortInfo.data.results && cohortInfo.data.results.length >= 1) {
      name = cohortInfo.data.results[0].name ?? ''
      description = cohortInfo.data.results[0].description ?? ''
      requestId = cohortInfo.data.results[0].request ?? ''
      favorite = cohortInfo.data.results[0].favorite ?? false
      uuid = cohortInfo.data.results[0].uuid ?? ''
    } else {
      throw new Error('This cohort is not your or invalid')
    }

    if (!name) {
      name = cohortResp.data.resourceType === 'Bundle' ? cohortResp.data.entry?.[0].resource?.name ?? '-' : '-'
    }

    const cohort = cohortResp.data.resourceType === 'Bundle' ? cohortResp.data.entry?.[0].resource : undefined

    const totalPatients = patientsResp.data.resourceType === 'Bundle' ? patientsResp.data.total : 0

    const originalPatients = getApiResponseResources(patientsResp)

    const agePyramidData =
      patientsResp.data.resourceType === 'Bundle'
        ? getAgeRepartitionMapAphp(
            patientsResp.data.meta?.extension?.find((facet: any) => facet.url === 'facet-age-month')?.extension
          )
        : undefined

    const genderRepartitionMap =
      patientsResp.data.resourceType === 'Bundle'
        ? getGenderRepartitionMapAphp(
            patientsResp.data.meta?.extension?.find((facet: any) => facet.url === 'facet-deceased')?.extension
          )
        : undefined

    const monthlyVisitData =
      encountersResp.data.resourceType === 'Bundle'
        ? getVisitRepartitionMapAphp(
            encountersResp.data.meta?.extension?.find(
              (facet: any) => facet.url === 'facet-visit-year-month-gender-facet'
            )?.extension
          )
        : undefined

    const visitTypeRepartitionData =
      encountersResp.data.resourceType === 'Bundle'
        ? getEncounterRepartitionMapAphp(
            encountersResp.data.meta?.extension?.find((facet: any) => facet.url === 'facet-class-simple')?.extension
          )
        : undefined

    return {
      name,
      description,
      cohort,
      totalPatients,
      originalPatients,
      genderRepartitionMap,
      visitTypeRepartitionData,
      agePyramidData,
      monthlyVisitData,
      requestId,
      favorite,
      uuid
    }
  },

  fetchPatientList: async (
    page,
    searchBy,
    searchInput,
    gender,
    age,
    vitalStatus,
    sortBy,
    sortDirection,
    groupId,
    includeFacets
  ) => {
    let _searchInput = ''
    const searches = searchInput
      .trim() // Remove space before/after search
      .split(' ') // Split by space (= ['mot1', 'mot2' ...])
      .filter((elem: string) => elem) // Filter if you have ['mot1', '', 'mot2'] (double space)
    for (const _search of searches) {
      _searchInput = _searchInput ? `${_searchInput} AND "${_search}"` : `"${_search}"`
    }

    let date1 = ''
    let date2 = ''
    if (age[0] !== 0 || age[1] !== 130) {
      date1 = moment()
        .subtract(age[1] + 1, 'years')
        .add(1, 'days')
        .format('YYYY-MM-DD') //`${today.getFullYear() - age[1]}-${monthStr}-${dayStr}`
      date2 = moment().subtract(age[0], 'years').format('YYYY-MM-DD') //`${today.getFullYear() - age[0]}-${monthStr}-${dayStr}`
    }

    const patientsResp = await fetchPatient({
      size: 20,
      offset: page ? (page - 1) * 20 : 0,
      _sort: sortBy,
      sortDirection: sortDirection === 'desc' ? 'desc' : 'asc',
      pivotFacet: includeFacets ? ['age_gender', 'deceased_gender'] : [],
      _list: groupId ? [groupId] : [],
      gender:
        gender === PatientGenderKind._unknown ? '' : gender === PatientGenderKind._other ? `other,unknown` : gender,
      searchBy,
      _text: _searchInput,
      minBirthdate: date1,
      maxBirthdate: date2,
      deceased: vitalStatus !== VitalStatus.all ? (vitalStatus === VitalStatus.deceased ? true : false) : undefined
    })

    const totalPatients = patientsResp.data.resourceType === 'Bundle' ? patientsResp.data.total : 0

    const originalPatients = getApiResponseResources(patientsResp)

    const agePyramidData =
      patientsResp.data.resourceType === 'Bundle'
        ? getAgeRepartitionMapAphp(
            patientsResp.data.meta?.extension?.filter((facet: any) => facet.url === 'facet-age-month')?.[0].extension
          )
        : undefined

    const genderRepartitionMap =
      patientsResp.data.resourceType === 'Bundle'
        ? getGenderRepartitionMapAphp(
            patientsResp.data.meta?.extension?.filter((facet: any) => facet.url === 'facet-deceased')?.[0].extension
          )
        : undefined

    return {
      totalPatients: totalPatients ?? 0,
      originalPatients,
      genderRepartitionMap,
      agePyramidData
    }
  },

  fetchDocuments: async (
    deidentifiedBoolean,
    sortBy,
    sortDirection,
    page,
    searchInput,
    selectedDocTypes,
    nda,
    startDate,
    endDate,
    groupId
  ) => {
    if (searchInput) {
      searchInput = searchInput
        .replaceAll('!', '%21')
        .replaceAll('#', '%23')
        .replaceAll('$', '%24')
        .replaceAll('&', '%26')
        .replaceAll("'", '%27')
        .replaceAll('(', '%28')
        .replaceAll(')', '%29')
        .replaceAll('*', '%2A')
        .replaceAll('+', '%2B')
        .replaceAll(',', '%2C')
        .replaceAll('/', '%2F')
        .replaceAll(':', '%3A')
        .replaceAll(';', '%3B')
        .replaceAll('=', '%3D')
        .replaceAll('?', '%3F')
        .replaceAll('@', '%40')
        .replaceAll('[', '%5B')
        .replaceAll(']', '%5D')
        .replaceAll('\n', '%20')
    }

    const [docsList, allDocsList] = await Promise.all([
      fetchComposition({
        size: 20,
        offset: page ? (page - 1) * 20 : 0,
        _sort: sortBy,
        sortDirection: sortDirection === 'desc' ? 'desc' : 'asc',
        status: 'final',
        _elements: searchInput ? [] : ['status', 'type', 'subject', 'encounter', 'date', 'title'],
        _list: groupId ? [groupId] : [],
        _text: searchInput,
        type: selectedDocTypes.length > 0 ? selectedDocTypes.join(',') : '',
        'encounter.identifier': nda,
        minDate: startDate ?? '',
        maxDate: endDate ?? ''
      }),
      !!searchInput ||
      !!selectedDocTypes ||
      !!nda ||
      (startDate ? [startDate, endDate ? endDate : ''] : endDate ? [endDate] : []).length > 0
        ? fetchComposition({
            status: 'final',
            _list: groupId ? [groupId] : [],
            size: 0
          })
        : null
    ])

    const totalDocs = docsList?.data?.resourceType === 'Bundle' ? docsList.data.total : 0
    const totalAllDocs =
      allDocsList !== null ? (allDocsList?.data?.resourceType === 'Bundle' ? allDocsList.data.total : 0) : totalDocs

    const documentsList = await getDocumentInfos(deidentifiedBoolean, getApiResponseResources(docsList), groupId)

    return {
      totalDocs: totalDocs ?? 0,
      totalAllDocs: totalAllDocs ?? 0,
      documentsList
    }
  },

  fetchDocumentContent: async (compositionId) => {
    const documentContent = await fetchCompositionContent(compositionId)
    return documentContent
  },

  fetchCohortExportRight: async (cohortId, providerId) => {
    try {
      const rightResponse = await fetchGroup({
        _list: [cohortId],
        provider: providerId
      })

      if (
        rightResponse &&
        // @ts-ignore
        rightResponse.data &&
        // @ts-ignore
        rightResponse.data.entry &&
        // @ts-ignore
        rightResponse.data.entry[0] &&
        // @ts-ignore
        rightResponse.data.entry[0].resource
      ) {
        //@ts-ignore
        const currentCohortItem = rightResponse.data.entry[0].resource.extension?.[0]
        const canMakeExport =
          currentCohortItem.extension && currentCohortItem.extension.length > 0
            ? currentCohortItem.extension.some(
                (extension: any) => extension.url === 'EXPORT_DATA_NOMINATIVE' && extension.valueString === 'true'
              ) &&
              currentCohortItem.extension.some(
                (extension: any) => extension.url === 'READ_DATA_NOMINATIVE' && extension.valueString === 'true'
              )
            : false
        return canMakeExport
      }
      return false
    } catch (error) {
      console.error('Error (fetchCohortExportRight) :', error)
      return false
    }
  },

  createExport: async (args) => {
    try {
      const { cohortId, motivation, tables, output_format = 'csv' } = args

      const exportResponse = await new Promise((resolve) => {
        resolve(
          apiPortail.post('/exports/', {
            cohort_id: cohortId,
            motivation,
            tables: tables.map((table: string) => ({
              omop_table_name: table
            })),
            output_format
          })
        )
      })
        .then((values) => {
          return values
        })
        .catch((error) => {
          return error
        })

      // @ts-ignore
      if (exportResponse && exportResponse && exportResponse.status !== 201) {
        // @ts-ignore
        return { error: exportResponse && exportResponse.response.data }
      } else {
        // @ts-ignore
        return exportResponse && exportResponse.data
      }
    } catch (error) {
      return { error }
    }
  }
}

export default servicesCohorts

const getDocumentInfos: (
  deidentifiedBoolean: boolean,
  documents?: IComposition[],
  groupId?: string
) => Promise<CohortComposition[]> = async (deidentifiedBoolean: boolean, documents, groupId) => {
  const cohortDocuments = documents as CohortComposition[]

  const listePatientsIds = cohortDocuments
    .map((e) => e.subject?.display?.substring(8))
    .filter((item, index, array) => array.indexOf(item) === index)
    .join()
  const listeEncounterIds = cohortDocuments
    .map((e) => e.encounter?.display?.substring(10))
    .filter((item, index, array) => array.indexOf(item) === index)
    .join()

  const [patients, encounters] = await Promise.all([
    fetchPatient({
      _id: listePatientsIds,
      _list: groupId ? [groupId] : [],
      _elements: ['extension', 'id', 'identifier']
    }),
    fetchEncounter({
      _id: listeEncounterIds,
      _list: groupId ? [groupId] : [],
      type: 'VISIT',
      _elements: ['status', 'serviceProvider', 'identifier']
    })
  ])

  if (encounters.data.resourceType !== 'Bundle' || !encounters.data.entry) {
    return []
  }

  const listeEncounters = encounters.data.entry.map((e: any) => e.resource)

  let listePatients = []
  if (patients.data.resourceType === 'Bundle' && patients.data.entry) {
    listePatients = patients?.data?.entry.map((e: any) => e.resource)
  }

  for (const document of cohortDocuments) {
    for (const patient of listePatients) {
      if (document.subject?.display?.substring(8) === patient.id) {
        document.idPatient = patient.id

        if (deidentifiedBoolean) {
          document.IPP = patient.id
        } else if (patient.identifier) {
          const ipp = patient.identifier.find((identifier: IIdentifier) => {
            return identifier.type?.coding?.[0].code === 'IPP'
          })
          document.IPP = ipp.value
        } else {
          document.IPP = 'Inconnu'
        }
      }
    }

    for (const encounter of listeEncounters) {
      if (document.encounter?.display?.substring(10) === encounter.id) {
        document.encounterStatus = encounter.status

        if (encounter.serviceProvider) {
          document.serviceProvider = encounter.serviceProvider.display
        } else {
          document.serviceProvider = 'Non renseigné'
        }

        if (deidentifiedBoolean) {
          document.NDA = encounter.id
        } else if (encounter.identifier) {
          const nda = encounter.identifier.find((identifier: IIdentifier) => {
            return identifier.type?.coding?.[0].code === 'NDA'
          })
          document.NDA = nda.value
        } else {
          document.NDA = 'Inconnu'
        }
      }
    }
  }

  return cohortDocuments
}
