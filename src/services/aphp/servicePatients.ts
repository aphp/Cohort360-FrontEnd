import { AxiosResponse } from 'axios'
import {
  CohortData,
  FHIR_API_Response,
  CohortEncounter,
  CohortComposition,
  SearchByTypes,
  MedicationEntry
} from 'types'
import {
  getGenderRepartitionMapAphp,
  getEncounterRepartitionMapAphp,
  getAgeRepartitionMapAphp,
  getVisitRepartitionMapAphp
} from 'utils/graphUtils'
import { getApiResponseResources } from 'utils/apiHelpers'
import {
  IClaim,
  ICondition,
  IIdentifier,
  IProcedure,
  IPatient,
  IMedicationRequest,
  IMedicationAdministration,
  IEncounter,
  IComposition,
  IObservation
} from '@ahryman40k/ts-fhir-types/lib/R4'
import {
  fetchGroup,
  fetchPatient,
  fetchEncounter,
  fetchClaim,
  fetchCondition,
  fetchProcedure,
  fetchComposition,
  fetchMedicationRequest,
  fetchMedicationAdministration,
  fetchObservation
} from './callApi'

import servicesPerimeters from './servicePerimeters'
import servicesCohorts from './serviceCohorts'

export interface IServicePatients {
  /*
   ** Cette fonction permet de récupérer un nombre de patient totale lié à un utilisateur
   **
   ** Elle ne prend aucun argument, et un nombre de patient
   */
  fetchPatientsCount: () => Promise<number>

  /*
   ** Cette fonction permet de récupérer l'ensemble des patients lié à un utilisateur
   **
   ** Elle ne prend aucun argument, et retourne un object CohortData ou undefined en cas d'erreur
   */
  fetchMyPatients: () => Promise<CohortData | undefined>

  /*
   ** Cette fonction permet de récupérer les informations necessaire a l'affichage de la page "Aperçu patient" (state/patient)
   **
   ** Argument:
   **   - patientId: identifiant technique d'un patient
   **   - groupId: (optionnel) Périmètre auquel le patient est lié
   **
   ** Retourne une partie du type du store Redux lié au patient (state/patient) ou undefined en cas d'erreur
   */
  fetchPatientInfo: (
    patientId: string,
    groupId?: string
  ) => Promise<
    | {
        patientInfo: IPatient & {
          lastEncounter?: IEncounter
          lastGhm?: IClaim
          lastProcedure?: IProcedure
          mainDiagnosis?: ICondition[]
        }
        hospits?: (CohortEncounter | IEncounter)[]
      }
    | undefined
  >

  /*
   ** Cette fonction permet de récupérer les élèments de PMSI lié à un patient
   **
   ** Argument:
   **   - page: permet la pagination des éléments
   **   - patientId: identifiant technique d'un patient
   **   - selectedTab: permet de selectionner la collection Condition, Procedure, ou Claim
   **   - searchInput: permet la recherche textuelle
   **   - nda: permet de filtrer sur un NDA précis
   **   - code: permet de filtrer un code
   **   - diagnosticTypes: permet de filtrer par un type de diagnostic (uniquement pour les CIM10)
   **   - sortBy: permet le tri
   **   - sortDirection: permet le tri dans l'ordre croissant ou décroissant
   **   - groupId: (optionnel) Périmètre auquel le patient est lié
   **   - startDate: (optionnel) permet le filtre par date
   **   - endDate: (optionnel) permet le filtre par date
   **
   ** Retour:
   **   - pmsiData: Liste de 20 éléments de PMSI lié à un patient et au "selectedTab", donc soit un élément de Condition, Procedure ou Claim
   **   - pmsiTotal: Nombre d'élément totale par rapport au filtre indiqué
   */
  fetchPMSI: (
    page: number,
    patientId: string,
    selectedTab: 'diagnostic' | 'ccam' | 'ghm',
    searchInput: string,
    nda: string,
    code: string,
    diagnosticTypes: string[],
    sortBy: string,
    sortDirection: string,
    groupId?: string,
    startDate?: string | null,
    endDate?: string | null
  ) => Promise<{
    pmsiData?: (IClaim | ICondition | IProcedure)[]
    pmsiTotal?: number
  }>

  /**
   * Cette fonction retourne la totalité des Procedures d'un patient donné
   *
   *
   */
  fetchAllProcedures: (patientId: string, groupId: string, size?: number) => Promise<IProcedure[]>

  /**
   * Cette fonction retourne la totalité des Conditions d'un patient donné
   *
   *
   */
  fetchAllConditions: (patientId: string, groupId: string, size?: number) => Promise<ICondition[]>

  /*
   ** Cette fonction permet de récupérer les élèments de Medication lié à un patient
   **
   ** Argument:
   **   - deidentified: permet certaine anonymisation de la donnée
   **   - page: permet la pagination des éléments
   **   - patientId: identifiant technique d'un patient
   **   - selectedTab: permet de selectionner la collection MedicationRequest ou MedicationAdministration
   **   - searchInput: permet la recherche textuelle
   **   - nda: permet de filtrer sur un NDA précis
   **   - sortBy: permet le tri
   **   - sortDirection: permet le tri dans l'ordre croissant ou décroissant
   **   - selectedPrescriptionTypeIds: permet le filtre par type de prescription
   **   - selectedAdministrationRouteIds: permet le filtre par la voie d'administration
   **   - groupId: (optionnel) Périmètre auquel le patient est lié
   **   - startDate: (optionnel) permet le filtre par date
   **   - endDate: (optionnel) permet le filtre par date
   **
   ** Retour:
   **   - medicationData: Liste de 20 éléments de Medication lié à un patient et à "selectedTab", donc soit un élément de MedicationRequest ou MedicationAdministration
   **   - medicationTotal: Nombre d'élément totale par rapport au filtre indiqué
   */

  fetchMedication: (
    page: number,
    patientId: string,
    selectedTab: 'prescription' | 'administration',
    sortBy: string,
    sortDirection: string,
    searchInput: string,
    nda: string,
    selectedPrescriptionTypeIds: string,
    selectedAdministrationRouteIds: string,
    groupId?: string,
    startDate?: string,
    endDate?: string
  ) => Promise<{
    medicationData?: MedicationEntry<IMedicationAdministration | IMedicationRequest>[]
    medicationTotal?: number
  }>

  /*
   ** Cette fonction permet de récupérer les élèments de Observation lié à un patient
   **
   ** Arguments:
   **   - deidentified: permet certaine anonymisation de la donnée
   **   - sortBy: permet le tri
   **   - sortDirection: permet le tri dans l'ordre croissant ou décroissant
   **   - page: permet la pagination des éléments
   **   - patientId: identifiant technique d'un patient
   **   - searchInput: permet la recherche textuelle
   **   - nda: permet de filtrer sur un NDA précis
   **   - loinc: permet de filtrer sur un code LOINC précis
   **   - anabio: permet de filtrer sur un code ANABIO précis
   **   - startDate: (optionnel) permet le filtre par date
   **   - endDate: (optionnel) permet le filtre par date
   **   - groupId: (optionnel) Périmètre auquel le patient est lié
   **
   ** Retour:
   **   - biologyList: Liste de 20 éléments de Observation lié à un patient
   **   - biologyTotal: Nombre d'élément total par rapport au filtre indiqué
   */
  fetchObservation: (
    sortBy: string,
    sortDirection: string,
    page: number,
    patientId: string,
    searchInput: string,
    nda: string,
    loinc: string,
    anabio: string,
    startDate?: string | null,
    endDate?: string | null,
    groupId?: string
  ) => Promise<{
    biologyList: IObservation[]
    biologyTotal: number
  }>

  /*
   ** Cette fonction permet de récupérer les élèments de Composition lié à un patient
   **
   ** Argument:
   **   - deidentified: permet certaine anonymisation de la donnée
   **   - sortBy: permet le tri
   **   - sortDirection: permet le tri dans l'ordre croissant ou décroissant
   **   - page: permet la pagination des éléments
   **   - patientId: identifiant technique d'un patient
   **   - searchInput: permet la recherche textuelle
   **   - selectedDocTypes: permet de filtrer par un type de documents
   **   - nda: permet de filtrer sur un NDA précis
   **   - onlyPdfAvailable: permet d'afficher ou non seulement les documents dont le PDF est disponible
   **   - startDate: (optionnel) permet le filtre par date
   **   - endDate: (optionnel) permet le filtre par date
   **   - groupId: (optionnel) Périmètre auquel le patient est lié
   **
   ** Retour:
   **   - docsList: Liste de 20 éléments de Composition lié à un patient
   **   - docsTotal: Nombre d'élément totale par rapport au filtre indiqué
   */
  fetchDocuments: (
    sortBy: string,
    sortDirection: string,
    page: number,
    patientId: string,
    searchInput: string,
    selectedDocTypes: string[],
    nda: string,
    onlyPdfAvailable: boolean,
    startDate?: string | null,
    endDate?: string | null,
    groupId?: string
  ) => Promise<{
    docsList: IComposition[]
    docsTotal: number
  }>

  /*
   ** Cette fonction permet de chercher un patient grâce à une barre de recherche
   **
   ** Argument:
   **   - nominativeGroupsIds: permet certaine anonymisation de la donnée
   **   - page: permet la pagination des éléments
   **   - sortBy: permet le tri
   **   - sortDirection: permet le tri dans l'ordre croissant ou décroissant
   **   - input: permet la recherche d'un patient
   **   - searchBy: permet la recherche sur un élément précis (nom, prénom ou indeterminé)
   **
   ** Retour:
   **   - patientList: Liste de 20 patients lié à la recherche
   **   - totalPatients: Nombre d'élément totale par rapport au filtre indiqué
   */
  searchPatient: (
    nominativeGroupsIds: string[] | undefined,
    page: number,
    sortBy: string,
    sortDirection: string,
    input: string,
    searchBy: SearchByTypes
  ) => Promise<{
    patientList: IPatient[]
    totalPatients: number
  }>

  /**
   * Retourne le droit de la vue d'un patient
   *
   * Arguments:
   *   - groupId: (optionnel) Périmètre auquel le patient est lié
   *
   * Retour :
   *   - Retourne true si les droits de vision sont en pseudo / false si c'est en nomi
   */
  fetchRights: (groupId: string) => Promise<boolean>
}

const servicesPatients: IServicePatients = {
  fetchPatientsCount: async () => {
    try {
      const response = await fetchPatient({ size: 0 })
      if (response?.data?.resourceType === 'OperationOutcome') return null as any
      return response.data.total ?? 0
    } catch (error: any) {
      console.error(error)
      return null as any
    }
  },

  fetchMyPatients: async () => {
    const [myPatientsResp, myPatientsEncounters] = await Promise.all([
      fetchPatient({
        pivotFacet: ['age_gender', 'deceased_gender'],
        size: 20,
        _sort: 'given',
        _elements: ['gender', 'name', 'birthDate', 'deceased', 'identifier', 'extension']
      }),
      fetchEncounter({
        facet: ['class', 'visit-year-month-gender-facet'],
        size: 0,
        type: 'VISIT'
      })
    ])

    const totalPatients = myPatientsResp.data.resourceType === 'Bundle' ? myPatientsResp.data.total : 0

    const originalPatients = getApiResponseResources(myPatientsResp)

    const agePyramidData =
      myPatientsResp.data.resourceType === 'Bundle'
        ? await getAgeRepartitionMapAphp(
            myPatientsResp.data.meta?.extension?.filter((facet: any) => facet.url === 'facet-age-month')?.[0].extension
          )
        : undefined

    const genderRepartitionMap =
      myPatientsResp.data.resourceType === 'Bundle'
        ? await getGenderRepartitionMapAphp(
            myPatientsResp.data.meta?.extension?.filter((facet: any) => facet.url === 'facet-deceased')?.[0].extension
          )
        : undefined

    const monthlyVisitData =
      myPatientsEncounters.data.resourceType === 'Bundle'
        ? await getVisitRepartitionMapAphp(
            myPatientsEncounters.data.meta?.extension?.filter(
              (facet: any) => facet.url === 'facet-visit-year-month-gender-facet'
            )?.[0].extension
          )
        : undefined

    const visitTypeRepartitionData =
      myPatientsEncounters.data.resourceType === 'Bundle'
        ? await getEncounterRepartitionMapAphp(
            myPatientsEncounters.data.meta?.extension?.filter((facet: any) => facet.url === 'facet-class-simple')?.[0]
              .extension
          )
        : undefined

    return {
      cohort: undefined,
      totalPatients,
      originalPatients,
      genderRepartitionMap,
      visitTypeRepartitionData,
      agePyramidData,
      monthlyVisitData
    }
  },

  fetchPMSI: async (
    page,
    patientId,
    selectedTab,
    searchInput,
    nda,
    code,
    diagnosticTypes,
    sortBy,
    sortDirection,
    groupId,
    startDate,
    endDate
  ) => {
    let pmsiResp: AxiosResponse<FHIR_API_Response<ICondition | IProcedure | IClaim>> | null = null

    switch (selectedTab) {
      case 'diagnostic':
        pmsiResp = await fetchCondition({
          offset: page ? (page - 1) * 20 : 0,
          size: 20,
          _list: groupId ? [groupId] : [],
          patient: patientId,
          _text: searchInput,
          _sort: sortBy === 'code' ? 'code' : 'recorded-date',
          sortDirection: sortDirection === 'desc' ? 'desc' : 'asc',
          'encounter.identifier': nda,
          code: code,
          type: diagnosticTypes,
          'min-recorded-date': startDate ?? '',
          'max-recorded-date': endDate ?? ''
        })
        break
      case 'ccam':
        pmsiResp = await fetchProcedure({
          offset: page ? (page - 1) * 20 : 0,
          size: 20,
          _list: groupId ? [groupId] : [],
          patient: patientId,
          _text: searchInput,
          _sort: sortBy === 'code' ? 'code' : 'date',
          sortDirection: sortDirection === 'desc' ? 'desc' : 'asc',
          'encounter.identifier': nda,
          code: code,
          minDate: startDate ?? '',
          maxDate: endDate ?? ''
        })
        break
      case 'ghm':
        pmsiResp = await fetchClaim({
          offset: page ? (page - 1) * 20 : 0,
          size: 20,
          _list: groupId ? [groupId] : [],
          patient: patientId,
          _text: searchInput,
          _sort: sortBy === 'code' ? 'diagnosis' : 'created',
          sortDirection: sortDirection === 'desc' ? 'desc' : 'asc',
          'encounter.identifier': nda,
          diagnosis: code,
          minCreated: startDate ?? '',
          maxCreated: endDate ?? ''
        })
        break
      default:
        pmsiResp = null
        break
    }

    if (pmsiResp === null) return {}

    const pmsiData: (IClaim | ICondition | IProcedure)[] | undefined = getApiResponseResources(pmsiResp)
    const pmsiTotal = pmsiResp.data.resourceType === 'Bundle' ? pmsiResp.data.total : 0

    return {
      pmsiData,
      pmsiTotal
    }
  },

  fetchAllProcedures: async (patientId, groupId, size) => {
    const proceduresResp = await fetchProcedure({
      offset: 20,
      size,
      _list: groupId ? [groupId] : [],
      patient: patientId,
      _sort: 'date',
      sortDirection: 'desc'
    })

    const proceduresData: IProcedure[] = getApiResponseResources(proceduresResp) ?? []
    return proceduresData
  },

  fetchAllConditions: async (patientId, groupId, size) => {
    const diagnosticsResp = await fetchCondition({
      offset: 20,
      size,
      _list: groupId ? [groupId] : [],
      patient: patientId,
      _sort: 'recorded-date',
      sortDirection: 'desc'
    })

    const diagnosticsData: ICondition[] = getApiResponseResources(diagnosticsResp) ?? []
    return diagnosticsData
  },

  fetchMedication: async (
    page,
    patientId,
    selectedTab,
    sortBy,
    sortDirection,
    searchInput,
    nda,
    selectedPrescriptionTypeIds,
    selectedAdministrationRouteIds,
    groupId,
    startDate,
    endDate
  ) => {
    let medicationResp: AxiosResponse<FHIR_API_Response<IMedicationRequest | IMedicationAdministration>> | null = null

    switch (selectedTab) {
      case 'prescription':
        medicationResp = await fetchMedicationRequest({
          offset: page ? (page - 1) * 20 : 0,
          size: 20,
          _list: groupId ? [groupId] : [],
          encounter: nda,
          patient: patientId,
          _text: searchInput,
          _sort: sortBy,
          sortDirection: sortDirection === 'desc' ? 'desc' : 'asc',
          type: selectedPrescriptionTypeIds,
          minDate: startDate,
          maxDate: endDate
        })
        break
      case 'administration':
        medicationResp = await fetchMedicationAdministration({
          offset: page ? (page - 1) * 20 : 0,
          size: 20,
          _list: groupId ? [groupId] : [],
          encounter: nda,
          patient: patientId,
          _text: searchInput,
          _sort: sortBy,
          sortDirection: sortDirection === 'desc' ? 'desc' : 'asc',
          route: selectedAdministrationRouteIds,
          minDate: startDate,
          maxDate: endDate
        })
        break
      default:
        medicationResp = null
        break
    }

    if (medicationResp === null) return {}

    const medicationData: (IMedicationAdministration | IMedicationRequest)[] | undefined =
      getApiResponseResources(medicationResp)
    const medicationTotal = medicationResp.data.resourceType === 'Bundle' ? medicationResp.data.total : 0

    return { medicationData, medicationTotal }
  },

  fetchObservation: async (
    sortBy: string,
    sortDirection: string,
    page: number,
    patientId: string,
    searchInput: string,
    nda: string,
    loinc: string,
    anabio: string,
    startDate?: string | null,
    endDate?: string | null,
    groupId?: string
  ) => {
    const observationResp = await fetchObservation({
      patient: patientId,
      _list: groupId ? [groupId] : [],
      _sort: sortBy,
      sortDirection: sortDirection === 'desc' ? 'desc' : 'asc',
      size: 20,
      offset: page ? (page - 1) * 20 : 0,
      _text: searchInput,
      encounter: nda,
      loinc: loinc,
      anabio: anabio,
      minDate: startDate ?? '',
      maxDate: endDate ?? ''
    })

    const biologyTotal = observationResp.data.resourceType === 'Bundle' ? observationResp.data.total : 0

    return {
      biologyList: getApiResponseResources(observationResp) ?? [],
      biologyTotal: biologyTotal ?? 0
    }
  },

  fetchDocuments: async (
    sortBy: string,
    sortDirection: string,
    page: number,
    patientId: string,
    searchInput: string,
    selectedDocTypes: string[],
    nda: string,
    onlyPdfAvailable?: boolean,
    startDate?: string | null,
    endDate?: string | null,
    groupId?: string
  ) => {
    const documentLines = 20 // Number of desired lines in the document array

    const docsList = await fetchComposition({
      patient: patientId,
      _list: groupId ? [groupId] : [],
      _sort: sortBy,
      sortDirection: sortDirection === 'desc' ? 'desc' : 'asc',
      size: documentLines,
      offset: page ? (page - 1) * documentLines : 0,
      status: 'final',
      _elements: !searchInput ? ['status', 'type', 'encounter', 'date', 'title', 'event'] : [],
      _text: searchInput,
      type: selectedDocTypes.join(','),
      'encounter.identifier': nda,
      onlyPdfAvailable: onlyPdfAvailable,
      minDate: startDate ?? '',
      maxDate: endDate ?? ''
    })

    if (docsList.data.resourceType !== 'Bundle' || !docsList.data.total) {
      return {
        docsTotal: 0,
        docsList: []
      }
    }

    return {
      docsTotal: docsList.data.total,
      docsList: getApiResponseResources(docsList) ?? []
    }
  },

  fetchPatientInfo: async (patientId, groupId) => {
    const [patientResponse, encounterResponse, encounterDetailResponse] = await Promise.all([
      fetchPatient({ _id: patientId, _list: groupId ? [groupId] : [] }),
      fetchEncounter({
        patient: patientId,
        type: 'VISIT',
        status: ['arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'unknown'],
        _sort: 'start-date',
        sortDirection: 'desc',
        _list: groupId ? [groupId] : []
      }),
      fetchEncounter({
        patient: patientId,
        'type:not': 'VISIT',
        _sort: 'start-date',
        sortDirection: 'desc',
        _list: groupId ? [groupId] : []
      })
    ])

    const patientDataList = getApiResponseResources(patientResponse)
    if (patientDataList === undefined || (patientDataList && patientDataList.length === 0)) return undefined
    const patientData = patientDataList[0]

    const encounters: IEncounter[] = getApiResponseResources(encounterResponse) || []
    const encountersDetail: IEncounter[] = getApiResponseResources(encounterDetailResponse) || []

    const hospits = await getEncounterDocuments(encounters, encountersDetail, groupId)

    const patientInfo = {
      ...patientData,
      lastEncounter: encounters && encounters.length > 0 ? encounters[0] : undefined
    }

    return {
      patientInfo,
      hospits
    }
  },

  searchPatient: async (nominativeGroupsIds, page, sortBy, sortDirection, input, searchBy) => {
    let search = ''
    if (input.trim() !== '') {
      if (searchBy === '_text') {
        const searches = input
          .trim() // Remove space before/after search
          .split(' ') // Split by space (= ['mot1', 'mot2' ...])
          .filter((elem: string) => elem) // Filter if you have ['mot1', '', 'mot2'] (double space)

        for (const _search of searches) {
          search = search ? `${search} AND "${_search}"` : `"${_search}"`
        }
      } else {
        search = input.trim()
      }
    }

    const patientResp = await fetchPatient({
      _list: nominativeGroupsIds,
      size: 20,
      offset: page ? (page - 1) * 20 : 0,
      _sort: sortBy,
      sortDirection: sortDirection === 'desc' ? 'desc' : 'asc',
      searchBy: searchBy,
      _text: search,
      _elements: ['gender', 'name', 'birthDate', 'deceased', 'identifier', 'extension']
    })

    const patientList = getApiResponseResources(patientResp)

    const totalPatients = patientResp.data.resourceType === 'Bundle' ? patientResp.data.total : 0

    return {
      patientList: patientList ?? [],
      totalPatients: totalPatients ?? 0
    }
  },

  fetchRights: async (groupId) => {
    const groups = await fetchGroup({ _id: groupId })
    const groupsData = getApiResponseResources(groups)

    if (!groupsData) return false

    const isPerimeter = groupsData.some((group) => group.managingEntity?.display?.search('Organization/') !== -1)

    if (isPerimeter) {
      const perimeterRights = await servicesPerimeters.fetchPerimetersRights(groupsData)
      return perimeterRights.some((perimeterRight) =>
        perimeterRight.extension?.some(
          ({ url, valueString }) => url === 'READ_ACCESS' && valueString === 'DATA_PSEUDOANONYMISED'
        )
      )
    } else {
      const cohortRights = await servicesCohorts.fetchCohortsRights(
        groupsData.map((groupData) => ({ fhir_group_id: groupData.id ?? '' }))
      )
      return cohortRights.some((cohortRight) =>
        cohortRight.extension?.some(
          ({ url, valueString }) => url === 'READ_ACCESS' && valueString === 'DATA_PSEUDOANONYMISED'
        )
      )
    }
  }
}

export default servicesPatients

export const getEncounterDocuments = async (
  encounters?: CohortEncounter[],
  encountersDetail?: CohortEncounter[],
  groupId?: string
) => {
  if (!encounters) return undefined
  if (encounters.length === 0) return encounters

  const _encounters = encounters
  const encountersIdList: any[] = []

  _encounters.forEach((encounter) => {
    encounter.documents = []
    encountersIdList.push(encounter.id)
  })

  const documentsResp = await fetchComposition({
    encounter: encountersIdList.join(','),
    _elements: ['status', 'type', 'subject', 'encounter', 'date', 'title', 'event'],
    status: 'final',
    _list: groupId ? groupId.split(',') : []
  })

  const documents: CohortComposition[] = getApiResponseResources(documentsResp) ?? []

  for (const encounter of _encounters) {
    const currentDocuments = documents?.filter(
      (document) => encounter.id === document.encounter?.display?.replace('Encounter/', '')
    )
    const currentDetails = encountersDetail?.filter(
      (encounterDetail) => encounter.id === encounterDetail?.partOf?.reference?.replace('Encounter/', '')
    )

    encounter.documents = currentDocuments
    encounter.details = currentDetails

    if (!currentDocuments || (currentDocuments && currentDocuments.length === 0)) continue

    for (const currentDocument of currentDocuments) {
      currentDocument.serviceProvider = encounter?.serviceProvider?.display ?? 'Non renseigné'

      currentDocument.NDA = encounter.id ?? 'Inconnu'
      if (encounter.identifier) {
        const nda = encounter.identifier.find((identifier: IIdentifier) => {
          return identifier.type?.coding?.[0].code === 'NDA'
        })
        if (nda) {
          currentDocument.NDA = nda?.value
        }
      }
    }
  }

  return _encounters
}
