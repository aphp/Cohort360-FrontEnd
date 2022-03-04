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

import {
  fetchGroup,
  fetchPatient,
  fetchEncounter,
  fetchComposition,
  fetchCompositionContent,
  fetchBinary
} from './callApi'

import apiBackend from '../apiBackend'

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
   *   - birthdates: Permet le filtre par date de naissances
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
    birthdates: [string, string],
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
    ipp: string,
    startDate?: string | null,
    endDate?: string | null,
    groupId?: string
  ) => Promise<{
    totalDocs: number
    totalAllDocs: number
    totalPatientDocs: number
    totalAllPatientDocs: number
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
   * Permet de recuperer le contenue d'un document (/Binary)
   *
   * Argument:
   *   - documentId: Identifiant du documents
   *
   * Retoune:
   *   - IComposition_Section: Contenue du document
   */
  fetchBinary: (documentId: string, list?: string[]) => Promise<any>

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
  fetchCohortExportRight: (cohortId: string) => Promise<boolean>

  /**
   * Permet la récupération des droits d'export lié a plusieurs cohortes
   *
   * Argument:
   *   - cohorts: Tableau de cohortes de type `Cohort[]`
   *
   * Retoune:
   *   - Si un utilisateur peut faire une demande d'export sur la cohorte
   */
  fetchCohortsExportRights: (cohorts: Cohort[]) => Promise<Cohort[]>

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

const servicesCohorts: IServiceCohorts = {
  fetchCohort: async (cohortId) => {
    // eslint-disable-next-line
    let fetchCohortsResults = await Promise.all([
      apiBackend.get<Back_API_Response<Cohort>>(`/cohort/cohorts/?fhir_group_id=${cohortId}`),
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
    birthdates,
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
      minBirthdate: birthdates[0],
      maxBirthdate: birthdates[1],
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
    ipp,
    startDate,
    endDate,
    groupId
  ) => {
    if (searchInput) {
      searchInput = encodeURIComponent(searchInput)
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
        'patient.identifier': ipp,
        minDate: startDate ?? '',
        maxDate: endDate ?? '',
        uniqueFacet: ['patient']
      }),
      !!searchInput || selectedDocTypes.length > 0 || !!nda || !!ipp || !!startDate || !!endDate
        ? fetchComposition({
            status: 'final',
            _list: groupId ? [groupId] : [],
            size: 0,
            uniqueFacet: ['patient']
          })
        : null
    ])

    const totalDocs = docsList?.data?.resourceType === 'Bundle' ? docsList.data.total : 0
    const totalAllDocs =
      allDocsList !== null ? (allDocsList?.data?.resourceType === 'Bundle' ? allDocsList.data.total : 0) : totalDocs

    const totalPatientDocs =
      docsList?.data?.resourceType === 'Bundle'
        ? (
            docsList?.data?.meta?.extension?.find((extension) => extension.url === 'unique-patient') || {
              valueDecimal: 0
            }
          ).valueDecimal
        : 0
    const totalAllPatientDocs =
      allDocsList !== null
        ? (
            allDocsList?.data?.meta?.extension?.find((extension) => extension.url === 'unique-patient') || {
              valueDecimal: 0
            }
          ).valueDecimal
        : totalPatientDocs

    const documentsList = await getDocumentInfos(deidentifiedBoolean, getApiResponseResources(docsList), groupId)

    return {
      totalDocs: totalDocs ?? 0,
      totalAllDocs: totalAllDocs ?? 0,
      totalPatientDocs: totalPatientDocs ?? 0,
      totalAllPatientDocs: totalAllPatientDocs ?? 0,
      documentsList
    }
  },

  fetchDocumentContent: async (compositionId) => {
    const documentContent = await fetchCompositionContent(compositionId)
    return documentContent
  },

  fetchBinary: async (documentId, list) => {
    const documentBinary = await fetchBinary({ _id: documentId, _list: list })

    // @ts-ignore
    return documentBinary && documentBinary.entry && documentBinary.entry[0] && documentBinary.entry[0].resource
  },

  fetchCohortExportRight: async (cohortId) => {
    try {
      const cohortResponse = await fetchGroup({ _id: cohortId })

      if (
        cohortResponse &&
        cohortResponse.data.resourceType === 'Bundle' &&
        cohortResponse.data &&
        cohortResponse.data.entry &&
        cohortResponse.data.entry[0]
      ) {
        const currentCohortItem = cohortResponse.data.entry[0]
        if (!currentCohortItem) return false

        const parentGroupId =
          currentCohortItem &&
          currentCohortItem.resource &&
          currentCohortItem.resource.member &&
          currentCohortItem.resource.member.length === 1
            ? currentCohortItem.resource.member[0].entity.display?.replace('Group/', '')
            : ''

        const parentResponse = await fetchGroup({ _id: parentGroupId || '' })

        const currentParentItems = (parentResponse.data.resourceType === 'Bundle' && parentResponse?.data?.entry) || []
        const caresiteIds = currentParentItems
          .map(
            (elem: any) =>
              elem.resource?.managingEntity?.display &&
              elem.resource?.managingEntity?.display.replace('Organization/', '')
          )
          .filter((item: any, index: number, array: any[]) => array.indexOf(item) === index)
          .join(',')

        const rightResponse = await apiBackend.get(`accesses/my-rights/?care-site-ids=${caresiteIds}`)
        const rightData: any = rightResponse.data ?? []
        const filteredRightData = rightData.filter(
          (_rightData: any) => _rightData.right_export_csv_nominative && _rightData.right_read_patient_nominative
        )

        return rightData.length > 0 && rightData.length === filteredRightData.length
      }
      return false
    } catch (error) {
      console.error('Error (fetchCohortExportRight) :', error)
      return false
    }
  },

  fetchCohortsExportRights: async (cohorts) => {
    try {
      // On recupère les info d'une cohort pour avoir les IDs des groupes
      const cohortsResponse = await Promise.all(
        cohorts.map(({ fhir_group_id }) =>
          new Promise((resolve) => {
            resolve(fetchGroup({ _id: fhir_group_id }))
          })
            .then((values) => {
              return values
            })
            .catch((error) => {
              return { error: true, ...error }
            })
        )
      )

      // On créer un dictionnaire pour faire le lien entre les cohortes et les périmètres
      const cohortLinkList = cohortsResponse
        .filter((cohortResponse: any) => cohortResponse.error !== true)
        .map(
          (cohortResponse: any) =>
            cohortResponse.data &&
            cohortResponse.data.resourceType === 'Bundle' &&
            cohortResponse.data.entry &&
            cohortResponse.data.entry[0] &&
            cohortResponse.data.entry[0].resource
        )

      const parentGroupsId =
        cohortLinkList && cohortLinkList.length > 0
          ? cohortLinkList
              .map((cohortLinkItem: any) =>
                cohortLinkItem && cohortLinkItem.member && cohortLinkItem.member.length === 1
                  ? cohortLinkItem.member[0].entity.display?.replace('Group/', '')
                  : ''
              )
              .filter((item: any, index: number, array: any[]) => array.indexOf(item) === index)
          : []

      const parentGroupsResponse = await Promise.all(
        parentGroupsId.map((parentGroupId: string) =>
          new Promise((resolve) => {
            resolve(fetchGroup({ _id: parentGroupId }))
          })
            .then((values) => {
              return values
            })
            .catch((error) => {
              return { error: true, ...error }
            })
        )
      )

      const organizationLinkList = parentGroupsResponse
        .filter((parentGroupResponse: any) => parentGroupResponse.error !== true)
        .map(
          (parentGroupResponse: any) =>
            parentGroupResponse.data &&
            parentGroupResponse.data.resourceType === 'Bundle' &&
            parentGroupResponse.data.entry &&
            parentGroupResponse.data.entry[0] &&
            parentGroupResponse.data.entry[0].resource
        )
      if (!organizationLinkList || organizationLinkList?.length === 0) return cohorts

      const caresiteIds = organizationLinkList
        .map(
          (currentParentItem: any) =>
            currentParentItem.managingEntity?.display &&
            currentParentItem.managingEntity?.display.replace('Organization/', '')
        )
        .filter((item: any, index: number, array: any[]) => array.indexOf(item) === index)
        .join(',')

      const rightResponse = await apiBackend.get(`accesses/my-rights/?care-site-ids=${caresiteIds}`)
      const rightData: any = rightResponse.data ?? []
      const filteredRightData = rightData.filter(
        (_rightData: any) => _rightData.right_export_csv_nominative && _rightData.right_read_patient_nominative
      )

      return cohorts.map((cohort) => {
        let valueBoolean = false
        const cohortLinkItem = cohortLinkList.find((cohortLink: any) => cohortLink.id === cohort.fhir_group_id)
        const organizationLinkItem = !cohortLinkItem
          ? undefined
          : organizationLinkList.find(
              (organizationLink: any) =>
                organizationLink.id === cohortLinkItem.member[0].entity.display?.replace('Group/', '')
            )

        valueBoolean =
          !cohortLinkItem || !organizationLinkItem
            ? false
            : filteredRightData.some(
                (filteredRightData: any) =>
                  filteredRightData.care_site_id ===
                  +organizationLinkItem.managingEntity.display.replace('Organization/', '')
              )

        return {
          ...cohort,
          extension: cohort.extension
            ? [...cohort.extension, { url: 'EXPORT_RIGHT', valueBoolean }]
            : [{ url: 'EXPORT_RIGHT', valueBoolean }]
        }
      })
    } catch (error) {
      console.error('Error (fetchCohortExportRight) :', error)
      return []
    }
  },

  createExport: async (args) => {
    try {
      const { cohortId, motivation, tables, output_format = 'csv' } = args

      const exportResponse = await new Promise((resolve) => {
        resolve(
          apiBackend.post('/exports/', {
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
