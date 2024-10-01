/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { RootState } from 'state'

import {
  CohortEncounter,
  CohortObservation,
  IPatientDetails,
  IPatientDocuments,
  IPatientPmsi,
  IPatientMedication,
  IPatientObservation,
  IPatientImaging,
  CohortImaging,
  CohortQuestionnaireResponse,
  CohortComposition
} from 'types'

import { impersonate, logout } from './me'

import services from 'services/aphp'
import servicesPerimeters from '../services/aphp/servicePerimeters'
import {
  Claim,
  Condition,
  DocumentReference,
  Encounter,
  Identifier,
  ImagingStudy,
  MedicationAdministration,
  MedicationRequest,
  Observation,
  Patient,
  Period,
  Procedure,
  QuestionnaireResponse
} from 'fhir/r4'
import { Direction, Order, PMSIFilters } from 'types/searchCriterias'
import { isCustomError } from 'utils/perimeters'
import { ResourceType } from 'types/requestCriterias'
import { getExtension } from 'utils/fhir'
import { getConfig } from 'config'
import { fetchPMSIList } from 'services/aphp/serviceExploration'
import { ResourceOptions } from 'types/exploration'

export type Medication = {
  administration?: IPatientMedication<MedicationAdministration>
  prescription?: IPatientMedication<MedicationRequest>
}

export type Pmsi = {
  condition?: IPatientPmsi<Condition>
  claim?: IPatientPmsi<Claim>
  procedure?: IPatientPmsi<Procedure>
}

export type PatientState = null | {
  loading: boolean
  deidentified?: boolean
  groupId?: string
  patientInfo?: IPatientDetails
  hospits?: {
    loading: boolean
    list: (CohortEncounter | Encounter)[]
  }
  documents?: IPatientDocuments
  pmsi?: Pmsi
  medication?: Medication
  biology?: IPatientObservation<CohortObservation>
  imaging?: IPatientImaging<CohortImaging>
  forms?: {
    maternityForms: {
      loading: boolean
      maternityFormsList: CohortQuestionnaireResponse[]
    }
  }
}

/**
 * fetchAllProcedure
 *
 */
type FetchAllProceduresParams = {
  patientId: string
  groupId?: string
}
type FetchAllProceduresReturn =
  | {
      procedure?: IPatientPmsi<Procedure>
      condition?: IPatientPmsi<Condition>
    }
  | undefined
const fetchAllProcedures = createAsyncThunk<FetchAllProceduresReturn, FetchAllProceduresParams, { state: RootState }>(
  'patient/fetchAllProcedures',
  async ({ patientId, groupId }, { getState }) => {
    try {
      const patientState = getState().patient

      const deidentified = patientState?.deidentified ?? true
      const hospits = patientState?.hospits?.list ?? []

      const procedureTotal = patientState?.pmsi?.procedure?.total ?? 0
      let procedureCount = patientState?.pmsi?.procedure?.list.length ?? 0
      const conditionTotal = patientState?.pmsi?.condition?.total ?? 0
      let conditionCount = patientState?.pmsi?.condition?.list.length ?? 0

      // API Calls:
      const [procedureResponses, conditionResponses] = await Promise.all([
        procedureTotal - procedureCount !== 0
          ? services.patients.fetchAllProcedures(patientId, groupId ?? '', procedureTotal - procedureCount)
          : null,
        conditionTotal - conditionCount !== 0
          ? services.patients.fetchAllConditions(patientId, groupId ?? '', conditionTotal - conditionCount)
          : null
      ])

      let procedureList: Procedure[] = procedureResponses
        ? linkElementWithEncounter(procedureResponses as Procedure[], hospits, deidentified)
        : []

      procedureList = patientState?.pmsi?.procedure?.list
        ? // eslint-disable-next-line no-unsafe-optional-chaining
          [...patientState?.pmsi?.procedure?.list, ...procedureList]
        : procedureList
      procedureCount = procedureList.length

      let conditionList: Condition[] = conditionResponses
        ? linkElementWithEncounter(conditionResponses as Condition[], hospits, deidentified)
        : []
      conditionList = patientState?.pmsi?.condition?.list
        ? // eslint-disable-next-line no-unsafe-optional-chaining
          [...patientState?.pmsi?.condition?.list, ...conditionList]
        : conditionList
      conditionCount = conditionList.length

      return {
        procedure: {
          loading: false,
          count: procedureCount,
          total: procedureTotal ?? procedureCount,
          list: procedureList,
          page: 1
        },
        condition: {
          loading: false,
          count: conditionCount,
          total: conditionTotal ?? conditionCount,
          list: conditionList,
          page: 1
        }
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

/**
 * fetchLastPmsi
 *
 */
type FetchLastPmsiParams = {
  patient: PatientState
  groupId?: string
}
type FetchLastPmsiReturn = {
  patientInfo: {
    lastGhm?: Claim | 'loading'
    lastProcedure?: Procedure | 'loading'
    mainDiagnosis?: Condition[] | 'loading'
  }
  pmsi?: {
    condition?: IPatientPmsi<Condition>
    claim?: IPatientPmsi<Claim>
    procedure?: IPatientPmsi<Procedure>
  }
} | null

const fetchLastPmsiInfo = createAsyncThunk<FetchLastPmsiReturn, FetchLastPmsiParams, { state: RootState }>(
  'patient/fetchLastPmsiInfo',
  async ({ patient, groupId }) => {
    try {
      //  const patientState = getState().patient
      const hospits = patient?.hospits?.list ?? []
      const deidentified = !!patient?.deidentified
      const options: ResourceOptions<PMSIFilters> = {
        deidentified,
        page: 0,
        searchCriterias: {
          orderBy: {
            orderBy: Order.DATE,
            orderDirection: Direction.DESC
          },
          searchInput: '',
          filters: { executiveUnits: [], encounterStatus: [], code: [], durationRange: [null, null] }
        },
        groupId: groupId ? [groupId] : [],
        patient
      }
      const fetchPatientResponse = await Promise.all([
        fetchPMSIList({ ...options, type: ResourceType.CONDITION }),
        fetchPMSIList({ ...options, type: ResourceType.PROCEDURE }),
        fetchPMSIList({ ...options, type: ResourceType.CLAIM })
      ])
      if (fetchPatientResponse === undefined) return null

      const conditionList = linkElementWithEncounter(fetchPatientResponse[0].list as Condition[], hospits, deidentified)
      const procedureList = linkElementWithEncounter(fetchPatientResponse[1].list as Procedure[], hospits, deidentified)
      const claimList = linkElementWithEncounter(fetchPatientResponse[2].list as Claim[], hospits, deidentified)

      return {
        patientInfo: {
          lastGhm: claimList ? (claimList[0] as Claim) : undefined,
          lastProcedure: procedureList ? (procedureList[0] as Procedure) : undefined,
          mainDiagnosis: conditionList.filter(
            (condition) =>
              getExtension(condition, getConfig().features.condition.extensions.orbisStatus)?.valueCodeableConcept
                ?.coding?.[0]?.code === 'dp'
          ) as Condition[]
        },
        pmsi: {
          condition: {
            loading: false,
            count: fetchPatientResponse[0].total ?? 0,
            total: fetchPatientResponse[0].total ?? 0,
            list: conditionList,
            page: 1
          },
          procedure: {
            loading: false,
            count: fetchPatientResponse[1].total ?? 0,
            total: fetchPatientResponse[1].total ?? 0,
            list: procedureList,
            page: 1
          },
          claim: {
            loading: false,
            count: fetchPatientResponse[2].total ?? 0,
            total: fetchPatientResponse[2].total ?? 0,
            list: claimList,
            page: 1
          }
        }
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

/**
 * fetchPatientInfo
 *
 */
type FetchPatientParams = {
  patientId: string
  groupId?: string
}
type FetchPatientReturn = {
  patientInfo: Patient & {
    lastEncounter?: Encounter
  }
  deidentified?: boolean
  groupId?: string
  hospits?: {
    loading: boolean
    list: (CohortEncounter | Encounter)[]
  }
} | null

const fetchPatientInfo = createAsyncThunk<FetchPatientReturn, FetchPatientParams, { state: RootState }>(
  'patient/fetchPatientInfo',
  async ({ patientId, groupId }, { getState, dispatch }) => {
    try {
      const fetchPatientResponse = await services.patients.fetchPatientInfo(patientId, groupId)
      if (fetchPatientResponse === undefined) return null

      const { patientInfo, hospits } = fetchPatientResponse
      let deidentifiedBoolean = true

      if (groupId) {
        deidentifiedBoolean = (await services.patients.fetchRights(groupId)) ?? {}
      } else {
        const rights = await services.perimeters.getRights({})
        if (!isCustomError(rights)) {
          deidentifiedBoolean = rights.results.some((right) =>
            right.rights ? servicesPerimeters.getAccessFromRights(right.rights) === 'Pseudonymisé' : false
          )
        }
      }
      const patient: PatientState = {
        loading: false,
        patientInfo,
        hospits: { list: hospits ?? [], loading: false },
        deidentified: deidentifiedBoolean
      }
      dispatch(fetchLastPmsiInfo({ patient, groupId }))

      const _patientInfo = {
        ...patientInfo,
        active: patientInfo.active,
        birthDate: patientInfo.birthDate,
        deceasedBoolean: patientInfo.deceasedBoolean ?? false,
        extension: patientInfo.extension,
        gender: patientInfo.gender,
        identifier: patientInfo.identifier,
        lastEncounter: patientInfo.lastEncounter,
        mainDiagnosis: patientInfo.mainDiagnosis ?? null,
        name: patientInfo.name
      }

      return {
        patientInfo: _patientInfo,
        deidentified: deidentifiedBoolean,
        hospits: {
          loading: false,
          list: hospits ?? []
        },
        groupId: groupId
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

const patientSlice = createSlice({
  name: 'patient',
  initialState: null as PatientState,
  reducers: {
    clearPatient: () => {
      return null
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logout.fulfilled, () => null)
    builder.addCase(impersonate, () => null)
    // fetchPatientInfo
    builder.addCase(fetchPatientInfo.pending, (state) =>
      state === null
        ? {
            loading: true,
            patientInfo: {
              resourceType: ResourceType.PATIENT,
              lastGhm: 'loading',
              lastProcedure: 'loading',
              mainDiagnosis: 'loading'
            }
          }
        : {
            ...state,
            loading: true,
            patientInfo: state.patientInfo
              ? state.patientInfo
              : {
                  resourceType: ResourceType.PATIENT
                }
          }
    )
    builder.addCase(fetchPatientInfo.fulfilled, (state, action) =>
      action.payload === null
        ? null
        : action.payload.patientInfo.id === state?.patientInfo?.id
        ? {
            ...state,
            loading: false,
            deidentified: action.payload.deidentified,
            groupId: action.payload.groupId,
            patientInfo: {
              ...(state?.patientInfo ?? {}),
              ...action.payload.patientInfo
            },
            hospits: action.payload.hospits
          }
        : {
            ...state,
            loading: false,
            deidentified: action.payload.deidentified,
            groupId: action.payload.groupId,
            patientInfo: {
              ...state?.patientInfo,
              ...action.payload.patientInfo
            },
            hospits: action.payload.hospits,
            documents: undefined,
            pmsi: undefined,
            medication: {
              administration: {
                loading: false,
                count: 0,
                total: null,
                list: [],
                page: 0
              },
              prescription: {
                loading: false,
                count: 0,
                total: null,
                list: [],
                page: 0
              }
            },
            biology: undefined,
            imaging: undefined,
            forms: undefined
          }
    )
    builder.addCase(fetchPatientInfo.rejected, () => null)
    builder.addCase(fetchLastPmsiInfo.pending, (state) =>
      state === null
        ? {
            loading: true,
            patientInfo: {
              resourceType: ResourceType.PATIENT,
              lastGhm: 'loading',
              lastProcedure: 'loading',
              mainDiagnosis: 'loading'
            }
          }
        : {
            ...state,
            loading: true,
            patientInfo: state.patientInfo
              ? { ...state.patientInfo, lastGhm: 'loading', lastProcedure: 'loading', mainDiagnosis: 'loading' }
              : {
                  resourceType: ResourceType.PATIENT,
                  lastGhm: 'loading',
                  lastProcedure: 'loading',
                  mainDiagnosis: 'loading'
                }
          }
    )
    builder.addCase(fetchLastPmsiInfo.fulfilled, (state, action) =>
      action.payload === null
        ? null
        : {
            ...state,
            loading: false,
            patientInfo: state?.patientInfo
              ? {
                  ...state?.patientInfo,
                  ...action.payload.patientInfo
                }
              : {
                  resourceType: ResourceType.PATIENT,
                  ...action.payload.patientInfo
                },
            pmsi: action.payload.pmsi
          }
    )
    builder.addCase(fetchLastPmsiInfo.rejected, (state) => ({
      ...state,
      loading: false,
      patientInfo: state?.patientInfo
        ? {
            ...state?.patientInfo,
            lastGhm: undefined,
            lastProcedure: undefined,
            mainDiagnosis: undefined
          }
        : {
            resourceType: ResourceType.PATIENT,
            lastGhm: undefined,
            lastProcedure: undefined,
            mainDiagnosis: undefined
          },
      pmsi: {
        procedure: {
          loading: false,
          count: 0,
          total: 0,
          list: [],
          page: 0
        },
        condition: {
          loading: false,
          count: 0,
          total: 0,
          list: [],
          page: 0
        },
        claim: {
          loading: false,
          count: 0,
          total: 0,
          list: [],
          page: 0
        }
      }
    }))
    builder.addCase(fetchAllProcedures.pending, (state) =>
      state === null
        ? null
        : {
            ...state,
            pmsi: state.pmsi
              ? {
                  ...state.pmsi,
                  procedure: state.pmsi.procedure
                    ? {
                        ...state.pmsi.procedure,
                        loading: true
                      }
                    : undefined,
                  condition: state.pmsi.condition
                    ? {
                        ...state.pmsi.condition,
                        loading: true
                      }
                    : undefined
                }
              : undefined
          }
    )
    builder.addCase(fetchAllProcedures.fulfilled, (state, action) =>
      action.payload === undefined
        ? null
        : {
            ...state,
            loading: false,
            pmsi: state?.pmsi
              ? {
                  ...state?.pmsi,
                  procedure: action.payload.procedure,
                  condition: action.payload.condition
                }
              : {
                  procedure: action.payload.procedure,
                  condition: action.payload.condition
                }
          }
    )
    builder.addCase(fetchAllProcedures.rejected, (state) => ({
      ...state,
      loading: false,
      pmsi: {
        procedure: {
          loading: false,
          count: 0,
          total: 0,
          list: [],
          page: 0
        },
        condition: {
          loading: false,
          count: 0,
          total: 0,
          list: [],
          page: 0
        }
      }
    }))
  }
})

export default patientSlice.reducer
export { fetchPatientInfo, fetchLastPmsiInfo, fetchAllProcedures }
export const { clearPatient } = patientSlice.actions

export function linkElementWithEncounter<
  T extends
    | Procedure
    | Condition
    | Claim
    | DocumentReference
    | MedicationRequest
    | MedicationAdministration
    | Observation
    | ImagingStudy
    | QuestionnaireResponse
>(elementEntries: T[], encounterList: CohortEncounter[], deidentifiedBoolean: boolean) {
  let elementList: (T & {
    serviceProvider?: string
    NDA?: string
    documents?: CohortComposition[]
    hospitDates?: string[]
  })[] = []

  for (const entry of elementEntries) {
    let newElement = entry as T & {
      serviceProvider?: string
      NDA?: string
      documents?: CohortComposition[]
      hospitDates?: string[]
    }

    let encounterId = ''
    switch (entry.resourceType) {
      case ResourceType.CLAIM:
        encounterId = (entry as Claim).item?.[0].encounter?.[0].reference?.replace(/^Encounter\//, '') ?? ''
        break
      case ResourceType.PROCEDURE:
      case ResourceType.CONDITION:
      case ResourceType.MEDICATION_REQUEST:
      case ResourceType.OBSERVATION:
      case ResourceType.IMAGING:
      case ResourceType.QUESTIONNAIRE_RESPONSE:
        encounterId = entry.encounter?.reference?.replace(/^Encounter\//, '') ?? ''
        break
      case ResourceType.DOCUMENTS:
        encounterId = (entry as DocumentReference).context?.encounter?.[0].reference?.replace(/^Encounter\//, '') ?? ''
        break
      case ResourceType.MEDICATION_ADMINISTRATION:
        encounterId = (entry as MedicationAdministration).context?.reference?.replace(/^Encounter\//, '') ?? ''
        break
    }

    const foundEncounter = encounterList.find(({ id }) => id === encounterId) || null
    const foundEncounterWithDetails =
      encounterList.find(({ details }) => details?.find(({ id }) => id === encounterId)) || null

    newElement = fillElementInformation(
      deidentifiedBoolean,
      newElement,
      foundEncounterWithDetails ?? foundEncounter,
      encounterId,
      newElement.resourceType
    )

    elementList = [...elementList, newElement]
  }

  return elementList
}

function fillElementInformation<
  T extends
    | Procedure
    | Condition
    | Claim
    | DocumentReference
    | MedicationRequest
    | MedicationAdministration
    | Observation
    | ImagingStudy
    | QuestionnaireResponse
>(
  deidentifiedBoolean: boolean,
  element: T,
  encounter: CohortEncounter | null,
  encounterId: string,
  resourceType: string
) {
  const newElement = element as T & {
    serviceProvider?: string
    NDA?: string
    documents?: CohortComposition[]
    hospitDates?: Period
  }

  const encounterIsDetailed = encounter?.id !== encounterId

  if (!encounterIsDetailed) {
    newElement.serviceProvider = encounter?.serviceProvider?.display ?? 'Non renseigné'
  } else {
    const foundEncounterDetail =
      // @ts-ignore
      encounter?.details?.find(({ id }) => id === encounterId) ?? encounter
    newElement.serviceProvider = foundEncounterDetail?.serviceProvider?.display ?? 'Non renseigné'
  }

  newElement.NDA = encounter?.id ?? 'Inconnu'

  if (!deidentifiedBoolean && encounter?.identifier) {
    const nda = encounter.identifier.find((identifier: Identifier) => identifier.type?.coding?.[0].code === 'NDA')
    if (nda) {
      newElement.NDA = nda?.value ?? 'Inconnu'
    }
  }

  if (resourceType !== ResourceType.DOCUMENTS && encounter?.documents && encounter.documents.length > 0) {
    newElement.documents = encounter.documents
  }

  if (resourceType === ResourceType.QUESTIONNAIRE_RESPONSE) {
    newElement.hospitDates = encounter?.period
  }

  return newElement
}
