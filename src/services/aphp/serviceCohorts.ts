import moment from 'moment'

import {
  CohortComposition,
  CohortData,
  SearchByTypes,
  VitalStatus,
  Back_API_Response,
  Cohort,
  AgeRepartitionType,
  GenderRepartitionType,
  searchInputError,
  errorDetails,
  PatientGenderKind
} from 'types'
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
  fetchBinary,
  fetchCheckDocumentSearchInput
} from './callApi'

import { ODD_EXPORT } from '../../constants'

import apiBackend from '../apiBackend'
import { DocumentReference, Identifier } from 'fhir/r4'

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
    page: number,
    searchBy: SearchByTypes,
    searchInput: string,
    gender: PatientGenderKind,
    birthdates: [string, string],
    vitalStatus: VitalStatus,
    sortBy: string,
    sortDirection: string,
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
    deidentifiedBoolean: boolean,
    searchBy: SearchByTypes,
    sortBy: string,
    sortDirection: string,
    page: number,
    searchInput: string,
    selectedDocTypes: string[],
    nda: string,
    ipp: string,
    onlyPdfAvailable: boolean,
    signal?: AbortSignal,
    startDate?: string | null,
    endDate?: string | null,
    groupId?: string
  ) => Promise<{
    totalDocs: number
    totalAllDocs: number
    totalPatientDocs: number
    totalAllPatientDocs: number
    documentsList: DocumentReference[]
  }>

  /**
   * Permet de vérifier si le champ de recherche textuelle est correct
   *
   * Argument:
   *   - searchInput: champ de recherche textuelle
   *
   * Retourne:
   *   - searchInputError: objet décrivant la ou les erreurs du champ de recherche s'il y en a
   */
  checkDocumentSearchInput: (searchInput: string, signal?: AbortSignal) => Promise<searchInputError>

  /**
   * Permet de récupérer le contenu d'un document
   *
   * Argument:
   *   - compositionId: Identifiant du document
   *
   * Retourne:
   *   - IComposition_Section: Contenu du document
   */
  fetchDocumentContent: (compositionId: string) => Promise<DocumentReference>

  /**
   * Permet de récupérer le contenu d'un document (/Binary)
   *
   * Argument:
   *   - documentId: Identifiant du document
   *
   * Retourne:
   *   - IComposition_Section: Contenu du document
   */
  fetchBinary: (documentId: string, list?: string[]) => Promise<any>

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
  createExport: (args: { cohortId: number; motivation: string; tables: string[] }) => Promise<any>
}

const servicesCohorts: IServiceCohorts = {
  fetchCohort: async (cohortId) => {
    try {
      const fetchCohortsResults = await Promise.all([
        apiBackend.get<Back_API_Response<Cohort>>(`/cohort/cohorts/?fhir_group_id=${cohortId}`),
        fetchGroup({ _id: cohortId }),
        fetchPatient({
          pivotFacet: ['age_gender', 'deceased_gender'],
          _list: [cohortId],
          size: 20,
          _sort: 'family',
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
        favorite: false,
        uuid: ''
      }
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
    deidentified,
    groupId,
    includeFacets,
    signal
  ) => {
    let _searchInput = ''
    const searches = searchInput
      .trim() // Remove space before/after search
      .split(' ') // Split by space (= ['mot1', 'mot2' ...])
      .filter((elem: string) => elem) // Filter if you have ['mot1', '', 'mot2'] (double space)
    for (const _search of searches) {
      _searchInput = _searchInput ? `${_searchInput} AND "${_search}"` : `"${_search}"`
    }

    // convert birthdates into days or months depending of if it's a deidentified perimeter or not
    const minBirthdate = Math.abs(moment(birthdates[0]).diff(moment(), deidentified ? 'months' : 'days'))
    const maxBirthdate = Math.abs(moment(birthdates[1]).diff(moment(), deidentified ? 'months' : 'days'))

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
      minBirthdate: minBirthdate,
      maxBirthdate: maxBirthdate,
      deceased: vitalStatus !== VitalStatus.all ? (vitalStatus === VitalStatus.deceased ? true : false) : undefined,
      deidentified: deidentified,
      signal: signal
    })

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

    return {
      totalPatients: totalPatients ?? 0,
      originalPatients,
      genderRepartitionMap,
      agePyramidData
    }
  },

  fetchDocuments: async (
    deidentifiedBoolean,
    searchBy,
    sortBy,
    sortDirection,
    page,
    searchInput,
    selectedDocTypes,
    nda,
    ipp,
    onlyPdfAvailable,
    signal,
    startDate,
    endDate,
    groupId
  ) => {
    const [docsList, allDocsList] = await Promise.all([
      fetchComposition({
        size: 20,
        offset: page ? (page - 1) * 20 : 0,
        searchBy: searchBy,
        _sort: sortBy,
        sortDirection: sortDirection === 'desc' ? 'desc' : 'asc',
        status: 'final',
        _elements: searchInput
          ? []
          : [
              'docstatus',
              'status',
              'type',
              'subject',
              'encounter',
              'date',
              'title',
              'event',
              'context',
              'content',
              'text',
              'description'
            ],
        _list: groupId ? [groupId] : [],
        _text: searchInput,
        highlight_search_results: true,
        type: selectedDocTypes.length > 0 ? selectedDocTypes.join(',') : '',
        'encounter.identifier': nda,
        'patient.identifier': ipp,
        onlyPdfAvailable: onlyPdfAvailable,
        signal: signal,
        minDate: startDate ?? '',
        maxDate: endDate ?? '',
        uniqueFacet: ['patient']
      }),
      !!searchInput || selectedDocTypes.length > 0 || !!nda || !!ipp || !!startDate || !!endDate
        ? fetchComposition({
            signal: signal,
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

    const documentsList = await getDocumentInfos(
      deidentifiedBoolean,
      getApiResponseResources(docsList),
      groupId,
      signal
    )

    return {
      totalDocs: totalDocs ?? 0,
      totalAllDocs: totalAllDocs ?? 0,
      totalPatientDocs: totalPatientDocs ?? 0,
      totalAllPatientDocs: totalAllPatientDocs ?? 0,
      documentsList
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
      const errors = checkDocumentSearchInput.find((parameter: any) => parameter.name === 'WARNING')?.part ?? []

      const parsedErrors: errorDetails[] = []

      errors.forEach((error: any) => {
        const splitError = error.valueString.split(';')

        const errorPositions = splitError.find((errorPart: any) => errorPart.includes('Positions'))

        const cleanedErrorPositions = errorPositions
          ? errorPositions.replaceAll(' ', '').replace('Positions:', '').split('char:').slice(1)
          : []

        const errorSolution = splitError.find((errorPart: any) => errorPart.includes('Solution'))
        const cleanedErrorSolution = errorSolution ? errorSolution.replace(' Solution: ', '') : ''

        const errorObject = {
          errorName: error.name,
          errorPositions: cleanedErrorPositions,
          errorSolution: cleanedErrorSolution
        }

        parsedErrors.push(errorObject)
      })

      return {
        isError: checkDocumentSearchInput.find((parameter: any) => parameter.name === 'VALIDÉ') ? false : true,
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
    const documentContent = await fetchCompositionContent(compositionId)
    return documentContent
  },

  fetchBinary: async (documentId, list) => {
    const documentBinary = await fetchBinary({ _id: documentId, _list: list })

    // @ts-ignore
    return documentBinary && documentBinary.entry && documentBinary.entry[0] && documentBinary.entry[0].resource
  },

  fetchCohortsRights: async (cohorts) => {
    try {
      // On recupère tous les ids de notre liste de cohort
      const ids = cohorts
        .map((cohort) => {
          return cohort.fhir_group_id
        })
        .filter((id) => id !== '')

      const cohortsResponse: any = await new Promise((resolve) => {
        resolve(fetchGroup({ _id: ids }))
      })
        .then((values) => {
          return values
        })
        .catch((error) => {
          return { error: true, ...error }
        })
      let caresiteIds = ''
      let organizationLinkList: any[] = []

      const cohortLinkList = cohortsResponse?.data?.entry?.[0]?.resource
        ? cohortsResponse.data.entry.map((cohortsResponse: any) => cohortsResponse.resource)
        : []

      // On cherche la liste des Organisations présente dans l'objet `member`
      caresiteIds =
        cohortLinkList?.length > 0
          ? cohortLinkList
              .map((cohortLinkItem: any) =>
                cohortLinkItem?.member?.length > 0
                  ? cohortLinkItem.member.map((member: any) =>
                      member.entity.display?.search('Organization/') !== -1
                        ? member.entity.display?.replace('Organization/', '')
                        : ''
                    )
                  : ''
              )
              .flat()
              .filter((item: any, index: number, array: any[]) => item && array.indexOf(item) === index)
              .join(',')
          : ''

      if (caresiteIds) {
        // Si une liste d'Organisation est présente dans l'objet `member`
        // On crée un dictionnaire pour faire le lien entre les Groups et les Organisations (Dictionnaire 2)
        organizationLinkList =
          cohortLinkList?.length > 0
            ? cohortLinkList
                .map((cohortLinkItem: any) => {
                  const members = cohortLinkItem?.member ?? []
                  let organizationLinks: any[] = []

                  for (let index = 0; index < members.length; index += 2) {
                    const group = members[index] || null
                    const organization = members[index + 1] || null
                    organizationLinks = [
                      ...organizationLinks,
                      {
                        id: group.entity.display.replace('Group/', ''),
                        managingEntity: organization.entity
                      }
                    ]
                  }

                  return organizationLinks
                })
                .flat()
                .filter((item: any, index: number, array: any[]) => item && array.indexOf(item) === index)
            : []
      } else {
        // Sinon
        // On cherche les Group ID
        const parentGroupsId =
          cohortLinkList?.length > 0
            ? cohortLinkList
                .map((cohortLinkItem: any) =>
                  cohortLinkItem?.member?.length > 0
                    ? cohortLinkItem.member.map((member: any) =>
                        member.entity.display?.search('Group/') !== -1
                          ? member.entity.display?.replace('Group/', '')
                          : ''
                      )
                    : ''
                )
                .flat()
                .filter((item: any, index: number, array: any[]) => item && array.indexOf(item) === index)
            : []

        // Pour récupérer les informations du périmètre de la cohorte
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

        // Et faire le lien avec les organisations, donc ...
        // On crée un dictionnaire pour faire le lien entre les Groups et les Organisations (Dictionnaire 2)
        organizationLinkList = parentGroupsResponse
          .filter((parentGroupResponse: any) => parentGroupResponse.error !== true)
          .map(
            (parentGroupResponse: any) =>
              parentGroupResponse?.data?.resourceType === 'Bundle' && parentGroupResponse?.data?.entry?.[0]?.resource
          )

        if (!organizationLinkList || organizationLinkList?.length === 0) return cohorts

        // On crée une liste des Organisations liées au périmètre (caresiteIds = string)
        caresiteIds = organizationLinkList
          .map((currentParentItem: any) => currentParentItem?.managingEntity?.display?.replace('Organization/', ''))
          .filter((item: any, index: number, array: any[]) => item && array.indexOf(item) === index)
          .join(',')
      }

      // On appelle le back-end pour avoir la liste des droits
      const rightsResponse = await apiBackend.get(`accesses/accesses/my-rights/?care-site-ids=${caresiteIds}`)
      const rightsData: any = rightsResponse.data ?? []

      return cohorts.map((cohort) => {
        const cohortLinkItem = cohortLinkList.find((cohortLink: any) => cohortLink?.id === cohort.fhir_group_id)
        const organizationLinkItems = !cohortLinkItem
          ? undefined
          : organizationLinkList.filter((organizationLink: any) =>
              cohortLinkItem?.member?.length > 0
                ? cohortLinkItem.member?.find(
                    (member: any) => member.entity.display?.replace('Group/', '') === organizationLink.id
                  )
                : false
            )
        const allRightOfCohort = !organizationLinkItems
          ? []
          : rightsData.filter((rightData: any) =>
              organizationLinkItems.find(
                (organizationLinkItem) =>
                  +organizationLinkItem.managingEntity.display.replace('Organization/', '') === rightData.care_site_id
              )
            )

        const newExtension = [
          {
            url: 'EXPORT_ACCESS',
            valueString:
              !!ODD_EXPORT &&
              allRightOfCohort.filter(
                (rightOfCohort: any) =>
                  rightOfCohort.right_export_csv_nominative === true &&
                  rightOfCohort.right_read_patient_nominative === true
              ).length === allRightOfCohort.length
                ? 'DATA_NOMINATIVE'
                : 'DATA_PSEUDOANONYMISED'
          },
          {
            url: 'READ_ACCESS',
            valueString:
              allRightOfCohort.filter(
                (rightOfCohort: any) => rightOfCohort.right_read_patient_nominative === true // eslint-disabled-line
              ).length === allRightOfCohort.length
                ? 'DATA_NOMINATIVE'
                : 'DATA_PSEUDOANONYMISED'
          }
        ]

        return {
          ...cohort,
          extension: cohort.extension ? [...cohort.extension, ...newExtension] : [...newExtension]
        }
      })
    } catch (error) {
      console.error('Error (fetchCohortsRights) :', error)
      return []
    }
  },

  createExport: async (args) => {
    try {
      const { cohortId, motivation, tables } = args

      const exportResponse = await new Promise((resolve) => {
        resolve(
          apiBackend.post('/exports/', {
            cohort_id: cohortId,
            motivation,
            tables: tables.map((table: string) => ({
              omop_table_name: table
            })),
            nominative: true, // Nominative should always be true when exporting a CSV (see issue #1113)
            output_format: 'csv'
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
  documents?: DocumentReference[],
  groupId?: string,
  signal?: AbortSignal
) => Promise<CohortComposition[]> = async (deidentifiedBoolean: boolean, documents, groupId, signal) => {
  const cohortDocuments = (documents as CohortComposition[]) ?? []

  const listePatientsIds = cohortDocuments
    .map((e) => e.subject?.reference?.substring(8))
    .filter((item, index, array) => array.indexOf(item) === index)
    .join()
  const listeEncounterIds = cohortDocuments
    .map((e) => e.context?.encounter?.[0]?.reference?.substring(10))
    .filter((item, index, array) => array.indexOf(item) === index)
    .join()

  const [patients, encounters] = await Promise.all([
    fetchPatient({
      _id: listePatientsIds,
      _list: groupId ? [groupId] : [],
      _elements: ['extension', 'id', 'identifier'],
      signal: signal
    }),
    fetchEncounter({
      _id: listeEncounterIds,
      _list: groupId ? [groupId] : [],
      type: 'VISIT',
      _elements: ['status', 'serviceProvider', 'identifier'],
      signal: signal
    }),
    signal
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
      if (document.subject?.reference?.substring(8) === patient.id) {
        document.idPatient = patient.id

        document.IPP = patient.id ?? 'Inconnu'
        if (patient.identifier) {
          const ipp = patient.identifier.find((identifier: Identifier) => {
            return identifier.type?.coding?.[0].code === 'IPP'
          })
          document.IPP = ipp?.value ?? 'Inconnu'
        }
      }
    }

    for (const encounter of listeEncounters) {
      if (document.context?.encounter?.[0].reference?.substring(10) === encounter.id) {
        document.encounterStatus = encounter.status

        if (encounter.serviceProvider) {
          document.serviceProvider = encounter?.serviceProvider?.display ?? 'Non renseigné'
        } else {
          document.serviceProvider = 'Non renseigné'
        }

        document.NDA = encounter.id ?? 'Inconnu'
        if (encounter.identifier) {
          const nda = encounter.identifier.find((identifier: Identifier) => {
            return identifier.type?.coding?.[0].code === 'NDA'
          })
          document.NDA = nda?.value ?? 'Inconnu'
        }
      }
    }
  }

  return cohortDocuments
}
