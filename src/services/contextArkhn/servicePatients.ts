import { AxiosResponse } from 'axios'
import {
  CohortComposition,
  CohortData,
  PMSIEntry,
  FHIR_API_Response,
  PatientData,
  CohortEncounter,
  CohortPatient,
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
  IMedicationAdministration
} from '@ahryman40k/ts-fhir-types/lib/R4'
import {
  fetchPatient,
  fetchEncounter,
  fetchClaim,
  fetchCondition,
  fetchProcedure,
  fetchComposition,
  fetchMedicationRequest,
  fetchMedicationAdministration
} from './callApi'

export interface IServicesPatients {
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
   ** Cette fonction permet de récupérer les informations lié à un patient
   **
   ** Arguement:
   **   - patientId: identifiant technique d'un patient
   **   - groupId: (optionnel) Périmètre auquel le patient est lié
   **
   ** Retourne un objet PatientData ou undefined en cas d'erreur
   */
  fetchPatient: (patientId: string, groupId?: string) => Promise<PatientData | undefined>

  /*
   ** Cette fonction permet de récupérer les élèments de PMSI lié à un patient
   **
   ** Arguement:
   **   - deidentified: permet certaine anonymisation de la donnée
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
    deidentified: boolean,
    page: number,
    patientId: string,
    selectedTab: 'CIM10' | 'CCAM' | 'GHM',
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
    pmsiData?: PMSIEntry<IClaim | ICondition | IProcedure>[]
    pmsiTotal?: number
  }>

  /*
   ** Cette fonction permet de récupérer les élèments de Medication lié à un patient
   **
   ** Arguement:
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
    deidentified: boolean,
    page: number,
    patientId: string,
    selectedTab: 'prescription' | 'administration',
    searchInput: string,
    nda: string,
    sortBy: string,
    sortDirection: string,
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
   ** Cette fonction permet de récupérer les élèments de Composition lié à un patient
   **
   ** Arguement:
   **   - deidentified: permet certaine anonymisation de la donnée
   **   - sortBy: permet le tri
   **   - sortDirection: permet le tri dans l'ordre croissant ou décroissant
   **   - page: permet la pagination des éléments
   **   - patientId: identifiant technique d'un patient
   **   - searchInput: permet la recherche textuelle
   **   - selectedDocTypes: permet de filtrer par un type de documents
   **   - nda: permet de filtrer sur un NDA précis
   **   - startDate: (optionnel) permet le filtre par date
   **   - endDate: (optionnel) permet le filtre par date
   **   - groupId: (optionnel) Périmètre auquel le patient est lié
   **
   ** Retour:
   **   - docsList: Liste de 20 éléments de Composition lié à un patient
   **   - docsTotal: Nombre d'élément totale par rapport au filtre indiqué
   */
  fetchDocuments: (
    deidentified: boolean,
    sortBy: string,
    sortDirection: string,
    page: number,
    patientId: string,
    searchInput: string,
    selectedDocTypes: string[],
    nda: string,
    startDate?: string | null,
    endDate?: string | null,
    groupId?: string
  ) => Promise<{
    docsList: CohortComposition[]
    docsTotal: number
  }>

  /*
   ** Cette fonction permet de chercher un patient grâce à une barre de recherche
   **
   ** Arguement:
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
}

const servicesPatients: IServicesPatients = {
  fetchPatientsCount: async () => {
    const response = await fetchPatient({ size: 0 })
    if (response?.data?.resourceType === 'OperationOutcome') return 0
    return response.data.total ?? 0
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
    deidentified,
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
      case 'CIM10':
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
      case 'CCAM':
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
      case 'GHM':
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

    const pmsiData =
      pmsiResp.data.resourceType === 'Bundle'
        ? await fillNDAAndServiceProviderPMSI(deidentified, getApiResponseResources(pmsiResp), groupId)
        : undefined

    const pmsiTotal = pmsiResp.data.resourceType === 'Bundle' ? pmsiResp.data.total : 0

    return {
      pmsiData,
      pmsiTotal
    }
  },

  fetchMedication: async (
    deidentified,
    page,
    patientId,
    selectedTab,
    searchInput,
    nda,
    sortBy,
    sortDirection,
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

    const medicationData: MedicationEntry<IMedicationAdministration | IMedicationRequest>[] | undefined =
      await fillNDAAndServiceProviderMedication(deidentified, getApiResponseResources(medicationResp), groupId)
    const medicationTotal = medicationResp.data.resourceType === 'Bundle' ? medicationResp.data.total : 0

    return { medicationData, medicationTotal }
  },

  fetchDocuments: async (
    deidentified: boolean,
    sortBy: string,
    sortDirection: string,
    page: number,
    patientId: string,
    searchInput: string,
    selectedDocTypes: string[],
    nda: string,
    startDate?: string | null,
    endDate?: string | null,
    groupId?: string
  ) => {
    const docsList = await fetchComposition({
      patient: patientId,
      _list: groupId ? [groupId] : [],
      _sort: sortBy,
      sortDirection: sortDirection === 'desc' ? 'desc' : 'asc',
      size: 20,
      offset: page ? (page - 1) * 20 : 0,
      status: 'final',
      _elements: !searchInput ? ['status', 'type', 'encounter', 'date', 'title'] : [],
      _text: searchInput,
      type: selectedDocTypes.join(','),
      'encounter.identifier': nda,
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
      docsList: (await fillNDAAndServiceProviderDocs(deidentified, getApiResponseResources(docsList), groupId)) ?? []
    }
  },

  fetchPatient: async (patientId, groupId) => {
    const [
      patientResponse,
      procedureResponse,
      encounterResponse,
      diagnosticResponse,
      ghmResponse,
      documentsResponse,
      medicationRequestResponse,
      medicationAdministrationResponse
    ] = await Promise.all([
      fetchPatient({ _id: patientId, _list: groupId ? [groupId] : [] }),
      fetchProcedure({
        patient: patientId,
        _sort: 'date',
        sortDirection: 'desc',
        size: 20,
        _list: groupId ? [groupId] : []
      }),
      fetchEncounter({
        patient: patientId,
        type: 'VISIT',
        status: ['arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'unknown'],
        _sort: 'start-date',
        sortDirection: 'desc',
        _list: groupId ? [groupId] : []
      }),
      fetchCondition({
        patient: patientId,
        _sort: 'recorded-date',
        sortDirection: 'desc',
        size: 20,
        _list: groupId ? [groupId] : []
      }),
      fetchClaim({
        patient: patientId,
        _sort: 'created',
        sortDirection: 'desc',
        size: 20,
        _list: groupId ? [groupId] : []
      }),
      fetchComposition({
        patient: patientId,
        _sort: 'date',
        sortDirection: 'desc',
        size: 20,
        _list: groupId ? [groupId] : [],
        _elements: ['status', 'type', 'encounter', 'date', 'title']
      }),
      fetchMedicationRequest({
        size: 20,
        _list: groupId ? [groupId] : [],
        patient: patientId
      }),
      fetchMedicationAdministration({
        size: 20,
        _list: groupId ? [groupId] : [],
        patient: patientId
      })
    ])

    const patientData = getApiResponseResources(patientResponse)

    const deidentifiedBoolean =
      patientData && patientData[0]
        ? patientData[0].extension?.find((extension) => extension.url === 'deidentified')?.valueBoolean
        : true

    const hospit = await getEncounterDocuments(getApiResponseResources(encounterResponse), deidentifiedBoolean, groupId)

    const documents =
      documentsResponse.data.resourceType === 'Bundle'
        ? await fillNDAAndServiceProviderDocs(deidentifiedBoolean, getApiResponseResources(documentsResponse), groupId)
        : undefined

    const documentsTotal = documentsResponse.data.resourceType === 'Bundle' ? documentsResponse.data.total : 0

    const consult =
      procedureResponse.data.resourceType === 'Bundle'
        ? await getProcedureDocuments(
            await fillNDAAndServiceProviderPMSI(
              deidentifiedBoolean,
              getApiResponseResources(procedureResponse),
              groupId
            ),
            deidentifiedBoolean,
            groupId
          )
        : undefined

    const consultTotal = procedureResponse.data.resourceType === 'Bundle' ? procedureResponse.data.total : 0

    const diagnostic =
      diagnosticResponse.data.resourceType === 'Bundle'
        ? await fillNDAAndServiceProviderPMSI(deidentifiedBoolean, getApiResponseResources(diagnosticResponse), groupId)
        : undefined

    const diagnosticTotal = diagnosticResponse.data.resourceType === 'Bundle' ? diagnosticResponse.data.total : 0

    const ghm =
      ghmResponse.data.resourceType === 'Bundle'
        ? await fillNDAAndServiceProviderPMSI(deidentifiedBoolean, getApiResponseResources(ghmResponse), groupId)
        : undefined

    const ghmTotal = ghmResponse.data.resourceType === 'Bundle' ? ghmResponse.data.total : 0

    const medicationRequest =
      medicationRequestResponse.data.resourceType === 'Bundle'
        ? getApiResponseResources(medicationRequestResponse)
        : undefined

    const medicationRequestTotal =
      medicationRequestResponse.data.resourceType === 'Bundle' ? medicationRequestResponse.data.total : 0

    const medicationAdministration =
      medicationAdministrationResponse.data.resourceType === 'Bundle'
        ? getApiResponseResources(medicationAdministrationResponse)
        : undefined

    const medicationAdministrationTotal =
      medicationAdministrationResponse.data.resourceType === 'Bundle' ? medicationAdministrationResponse.data.total : 0

    const patient = patientResponse.data
      ? ({
          ...patientData?.[0],
          lastEncounter: hospit?.[0],
          lastProcedure: consult?.[0],
          lastGhm: ghm?.[0],
          mainDiagnosis: diagnostic?.filter((diagnostic: any) => {
            return diagnostic.extension?.[0].valueString === 'dp'
          })
        } as CohortPatient)
      : undefined

    return {
      hospit,
      documents,
      documentsTotal,
      consult,
      consultTotal,
      diagnostic,
      diagnosticTotal,
      ghm,
      ghmTotal,
      medicationRequest,
      medicationRequestTotal,
      medicationAdministration,
      medicationAdministrationTotal,
      patient
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
  }
}

export default servicesPatients

export async function fillNDAAndServiceProviderPMSI<T extends IProcedure | ICondition | IClaim>(
  deidentifiedBoolean?: boolean,
  pmsi?: T[],
  groupId?: string
): Promise<PMSIEntry<T>[] | undefined> {
  if (!pmsi) {
    return undefined
  }

  const pmsiEntries: PMSIEntry<T>[] = pmsi
  const listeEncounterIds = pmsiEntries
    .map((e) =>
      e.resourceType === 'Claim'
        ? //@ts-ignore
          e.item?.[0].encounter?.[0].reference?.substring(10)
        : //@ts-ignore
          e.encounter?.reference?.substring(10)
    )
    .filter((s): s is string => undefined !== s)

  const noDuplicatesList: string[] = []
  for (const element of listeEncounterIds) {
    if (!noDuplicatesList.includes(element)) {
      noDuplicatesList.push(element)
    }
  }

  if (noDuplicatesList.length === 0) {
    return pmsiEntries
  }

  const encounters = await fetchEncounter({
    _id: noDuplicatesList.join(','),
    type: 'VISIT',
    _elements: ['serviceProvider', 'identifier'],
    _list: groupId ? [groupId] : []
  })

  if (!encounters || encounters.data.resourceType !== 'Bundle' || !encounters.data.entry) {
    return []
  }

  const listeEncounters = encounters.data.entry.map((e: any) => e.resource)

  for (const entry of pmsiEntries) {
    for (const encounter of listeEncounters) {
      const pmsiEncounterId =
        entry.resourceType === 'Claim'
          ? // @ts-ignore
            (entry as PMSIEntry<IClaim>).item?.[0].encounter?.[0].reference?.substring(10)
          : (entry as IProcedure | ICondition).encounter?.reference?.substring(10)

      if (pmsiEncounterId === encounter.id) {
        entry.serviceProvider = encounter.serviceProvider.display ?? 'Non renseigné'

        if (deidentifiedBoolean) {
          entry.NDA = encounter.id
        } else if (encounter.identifier) {
          const nda = encounter.identifier.filter((identifier: IIdentifier) => {
            return identifier.type?.coding?.[0].code === 'NDA'
          })
          entry.NDA = nda[0].value
        } else {
          entry.NDA = 'Inconnu'
        }
      }
    }
  }

  return pmsiEntries
}

export async function fillNDAAndServiceProviderMedication<T extends IMedicationRequest | IMedicationAdministration>(
  deidentifiedBoolean?: boolean,
  medication?: T[],
  groupId?: string
): Promise<MedicationEntry<T>[] | undefined> {
  if (!medication) {
    return undefined
  }

  const medicationEntries: MedicationEntry<T>[] = medication
  const listeEncounterIds = medicationEntries
    .map((e) =>
      e.resourceType === 'MedicationRequest'
        ? // @ts-ignore
          e.encounter?.reference?.replace(/^Encounter\//, '')
        : // @ts-ignore
          e.context?.reference?.replace(/^Encounter\//, '')
    )
    .filter((s): s is string => undefined !== s)

  const noDuplicatesList: string[] = listeEncounterIds.filter((item, index, array) => array.indexOf(item) === index)
  if (noDuplicatesList.length === 0) return medicationEntries

  const encounters = await fetchEncounter({
    _id: noDuplicatesList.join(','),
    type: 'VISIT',
    _elements: ['serviceProvider', 'identifier'],
    _list: groupId ? [groupId] : []
  })

  if (!encounters || encounters.data.resourceType !== 'Bundle' || !encounters.data.entry) {
    return []
  }

  const listeEncounters = encounters.data.entry.map((e: any) => e.resource)

  for (const entry of medicationEntries) {
    const medicationEncounterId =
      entry.resourceType === 'MedicationRequest'
        ? // @ts-ignore
          entry.encounter?.reference?.replace(/^Encounter\//, '')
        : // @ts-ignore
          entry.context?.reference?.replace(/^Encounter\//, '')

    const foundEncounter = listeEncounters.find((encounter: any) => encounter.id === medicationEncounterId)
    if (!foundEncounter) continue

    entry.serviceProvider = foundEncounter.serviceProvider.display ?? 'Non renseigné'
    if (deidentifiedBoolean) {
      entry.NDA = foundEncounter.id
    } else if (foundEncounter.identifier) {
      const nda = foundEncounter.identifier.filter((identifier: IIdentifier) => {
        return identifier.type?.coding?.[0].code === 'NDA'
      })
      entry.NDA = nda[0].value
    } else {
      entry.NDA = 'Inconnu'
    }
  }

  return medicationEntries
}

export const fillNDAAndServiceProviderDocs = async (
  deidentifiedBoolean?: boolean,
  docs?: CohortComposition[],
  groupId?: string
) => {
  if (!docs) {
    return undefined
  }

  const listeEncounterIds: string[] = docs
    .map((e) => e.encounter?.display?.substring(10))
    .filter((s): s is string => undefined !== s)
  const noDuplicatesList: string[] = []
  for (const element of listeEncounterIds) {
    if (!noDuplicatesList.includes(element)) {
      noDuplicatesList.push(element)
    }
  }

  if (noDuplicatesList.length === 0) {
    return docs
  }

  const encounters = await fetchEncounter({
    _id: noDuplicatesList.join(','),
    _list: groupId ? [groupId] : [],
    type: 'VISIT',
    _elements: ['status', 'serviceProvider', 'identifier']
  })

  if (encounters.data.resourceType !== 'Bundle' || !encounters.data.entry) {
    return []
  }

  const listeEncounters = encounters.data.entry.map((e: any) => e.resource)

  for (const doc of docs) {
    for (const encounter of listeEncounters) {
      if (doc.encounter?.display?.substring(10) === encounter.id) {
        doc.encounterStatus = encounter.status ?? 'Statut inconnu'

        doc.serviceProvider = encounter.serviceProvider.display ?? 'Non renseigné'

        if (deidentifiedBoolean) {
          doc.NDA = encounter.id
        } else if (encounter.identifier) {
          const nda = encounter.identifier.filter((identifier: IIdentifier) => {
            return identifier.type?.coding?.[0].code === 'NDA'
          })
          doc.NDA = nda[0].value
        } else {
          doc.NDA = 'Inconnu'
        }
      }
    }
  }

  return docs
}

export const getEncounterDocuments = async (
  encounters?: CohortEncounter[],
  deidentifiedBoolean?: boolean,
  groupId?: string
) => {
  if (!encounters) return undefined
  if (encounters.length === 0) return encounters

  const _encounters = encounters

  const encountersList: any[] = []

  _encounters.forEach((encounter) => {
    encounter.documents = []
    encountersList.push(encounter.id)
  })

  const documentsResp = await fetchComposition({
    encounter: encountersList.join(','),
    _elements: ['status', 'type', 'subject', 'encounter', 'date', 'title']
  })

  const documents =
    documentsResp.data.resourceType === 'Bundle'
      ? await fillNDAAndServiceProviderDocs(deidentifiedBoolean, getApiResponseResources(documentsResp), groupId)
      : undefined

  if (!documents) return _encounters

  documents.forEach((document) => {
    const encounterIndex = _encounters.findIndex((encounter) => encounter.id === document.encounter?.display?.slice(10))

    if (!encounterIndex) return

    _encounters[encounterIndex].documents?.push(document)
  })

  return _encounters
}

export const getProcedureDocuments = async (
  procedures?: PMSIEntry<IProcedure>[],
  deidentifiedBoolean?: boolean,
  groupId?: string
) => {
  if (!procedures) return undefined
  if (procedures.length === 0) return procedures
  const _procedures = procedures

  let encountersList: any[] = []

  _procedures.forEach((procedure) => {
    procedure.documents = []
    encountersList.push(procedure.encounter?.reference?.slice(10))
  })

  encountersList = encountersList.filter((item, index, array) => array.indexOf(item) === index)

  const documentsResp = await fetchComposition({
    encounter: encountersList.join(','),
    _elements: ['status', 'type', 'subject', 'encounter', 'date', 'title']
  })

  const documents =
    documentsResp.data.resourceType === 'Bundle'
      ? await fillNDAAndServiceProviderDocs(deidentifiedBoolean, getApiResponseResources(documentsResp), groupId)
      : undefined

  if (!documents) return _procedures

  documents.forEach((document) => {
    const procedureIndex = _procedures.findIndex(
      (procedure) => procedure.encounter?.reference === document.encounter?.display
    )

    if (!procedureIndex) return

    _procedures[procedureIndex].documents?.push(document)
  })

  return _procedures
}
