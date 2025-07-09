import { CohortData, CohortEncounter, CohortComposition, ChartCode } from 'types'
import {
  getGenderRepartitionMapAphp,
  getEncounterRepartitionMapAphp,
  getAgeRepartitionMapAphp,
  getVisitRepartitionMapAphp
} from 'utils/graphUtils'
import { getApiResponseResources } from 'utils/apiHelpers'
import {
  fetchPatient,
  fetchEncounter,
  fetchCondition,
  fetchProcedure,
  fetchDocumentReference,
  fetchQuestionnaires
} from './callApi'

import servicesPerimeters from './servicePerimeters'
import servicesCohorts from './serviceCohorts'
import { Claim, Condition, Encounter, Identifier, Patient, Procedure, Questionnaire } from 'fhir/r4'
import { Direction, FormNames, Order } from 'types/searchCriterias'
import { getExtension } from 'utils/fhir'

export interface IServicePatients {
  /*
   ** Cette fonction permet de récupérer un nombre de patient totale lié à un utilisateur
   **
   ** Elle ne prend aucun argument, et un nombre de patient
   */
  fetchPatientsCount: (signal?: AbortSignal) => Promise<number | null>

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
        patientInfo: Patient & {
          lastEncounter?: Encounter
          lastGhm?: Claim
          lastProcedure?: Procedure
          mainDiagnosis?: Condition[]
        }
        hospits?: (CohortEncounter | Encounter)[]
      }
    | undefined
  >

  /**
   * Cette fonction retourne la totalité des Procedures d'un patient donné
   *
   *
   */
  fetchAllProcedures: (patientId: string, groupId: string, size?: number) => Promise<Procedure[]>

  /**
   * Cette fonction retourne la totalité des Conditions d'un patient donné
   *
   *
   */
  fetchAllConditions: (patientId: string, groupId: string, size?: number) => Promise<Condition[]>

  /*
   ** Cette fonction permet de récupérer les ids des formulaires
   **
   ** Retour:
   **   - questionnairesList: liste des ids des formulaires
   */
  fetchQuestionnaires: () => Promise<Questionnaire[]>

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
  fetchPatientsCount: async (signal?: AbortSignal) => {
    try {
      const response = await fetchPatient({ size: 0, signal })
      if (response?.data?.resourceType === 'OperationOutcome') return null
      return response.data.total ?? 0
    } catch (error) {
      console.error(error)
      return null
    }
  },

  fetchMyPatients: async () => {
    const [myPatientsResp, myPatientsEncounters] = await Promise.all([
      fetchPatient({
        pivotFacet: ['age-month_gender', 'deceased_gender'],
        size: 20,
        _sort: 'family',
        _elements: ['gender', 'name', 'birthDate', 'deceased', 'identifier', 'extension']
      }),
      fetchEncounter({
        facet: ['class', 'visit-year-month-gender-facet'],
        size: 0,
        visit: true
      })
    ])

    const totalPatients = myPatientsResp.data.resourceType === 'Bundle' ? myPatientsResp.data.total : 0

    const originalPatients = getApiResponseResources(myPatientsResp)

    const agePyramidData =
      myPatientsResp.data.resourceType === 'Bundle'
        ? getAgeRepartitionMapAphp(getExtension(myPatientsResp.data.meta, ChartCode?.AGE_PYRAMID)?.extension)
        : undefined

    const genderRepartitionMap =
      myPatientsResp.data.resourceType === 'Bundle'
        ? getGenderRepartitionMapAphp(getExtension(myPatientsResp.data.meta, ChartCode?.GENDER_REPARTITION)?.extension)
        : undefined

    const monthlyVisitData =
      myPatientsEncounters.data.resourceType === 'Bundle'
        ? getVisitRepartitionMapAphp(getExtension(myPatientsEncounters.data.meta, ChartCode?.MONTHLY_VISITS)?.extension)
        : undefined

    const visitTypeRepartitionData =
      myPatientsEncounters.data.resourceType === 'Bundle'
        ? getEncounterRepartitionMapAphp(
            getExtension(myPatientsEncounters.data.meta, ChartCode?.VISIT_TYPE_REPARTITION)?.extension
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

  fetchAllProcedures: async (patientId, groupId, size) => {
    const proceduresResp = await fetchProcedure({
      offset: 20,
      size,
      _list: groupId ? [groupId] : [],
      subject: patientId,
      _sort: 'date',
      sortDirection: Direction.DESC
    })

    const proceduresData: Procedure[] = getApiResponseResources(proceduresResp) ?? []
    return proceduresData
  },

  fetchAllConditions: async (patientId, groupId, size) => {
    const diagnosticsResp = await fetchCondition({
      offset: 20,
      size,
      _list: groupId ? [groupId] : [],
      subject: patientId,
      _sort: Order.RECORDED_DATE,
      sortDirection: Direction.DESC
    })

    const diagnosticsData: Condition[] = getApiResponseResources(diagnosticsResp) ?? []
    return diagnosticsData
  },

  fetchQuestionnaires: async () => {
    const maternityQuestionnaires = `${FormNames.PREGNANCY},${FormNames.HOSPIT}`
    const questionnaireList = await fetchQuestionnaires({ name: maternityQuestionnaires, _elements: ['id', 'name'] })

    return getApiResponseResources(questionnaireList) ?? []
  },

  fetchPatientInfo: async (patientId, groupId) => {
    const [patientResponse, encounterResponse] = await Promise.all([
      fetchPatient({ _id: patientId, _list: groupId ? [groupId] : [] }),
      fetchEncounter({
        patient: patientId,
        _sort: 'date',
        sortDirection: Direction.DESC,
        _list: groupId ? [groupId] : [],
        size: 1000
      })
    ])

    const patientDataList = getApiResponseResources(patientResponse)
    if (patientDataList === undefined || (patientDataList && patientDataList.length === 0)) return undefined
    const patientData = patientDataList[0]

    const cleanedEncounters: Encounter[] = getApiResponseResources(encounterResponse) || []
    const encounters = cleanedEncounters.filter((encounter) => !encounter.partOf)
    const encountersDetails = cleanedEncounters.filter((encounter) => encounter.partOf)

    const hospits = await getEncounterDocuments(encounters, encountersDetails, groupId)

    const patientInfo = {
      ...patientData,
      lastEncounter: encounters && encounters.length > 0 ? encounters[0] : undefined
    }

    return {
      patientInfo,
      hospits
    }
  },

  fetchRights: async (groupId) => {
    const perimetersResponse = await servicesPerimeters.getPerimeters({ cohortIds: groupId })

    if (perimetersResponse.results.length > 0) {
      const perimeterRights = await servicesPerimeters.fetchPerimetersRights(perimetersResponse.results)
      return perimeterRights.some(
        (right) => getExtension(right, 'READ_ACCESS')?.valueString === 'DATA_PSEUDOANONYMISED'
      )
    } else {
      const cohortRights = await servicesCohorts.fetchCohortsRights([{ group_id: groupId }])
      return cohortRights?.[0]?.rights?.read_patient_pseudo
        ? cohortRights?.[0]?.rights?.read_patient_nomi
          ? false
          : true
        : false
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
  const encountersIdList: string[] = []

  _encounters.forEach((encounter) => {
    encounter.documents = []
    encountersIdList.push(encounter.id ?? '')
  })

  const documentsResp = await fetchDocumentReference({
    encounter: encountersIdList.join(','),
    _list: groupId ? groupId.split(',') : []
  })

  const documents: CohortComposition[] = getApiResponseResources(documentsResp) ?? []

  for (const encounter of _encounters) {
    const currentDocuments = documents?.filter(
      (document) => encounter.id === document.context?.encounter?.[0].reference?.replace('Encounter/', '')
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
        const nda = encounter.identifier.find((identifier: Identifier) => {
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
