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
  CohortImaging
} from 'types'

import { logout } from './me'

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
  Procedure
} from 'fhir/r4'
import { CanceledError } from 'axios'
import {
  BiologyFilters,
  Direction,
  ImagingFilters,
  MedicationFilters,
  Order,
  PMSIFilters,
  DocumentsFilters,
  SearchByTypes,
  SearchCriterias
} from 'types/searchCriterias'
import { isCustomError } from 'utils/perimeters'
import { RessourceType } from 'types/requestCriterias'
import { mapToAttribute } from 'mappers/pmsi'
import {
  BIOLOGY_HIERARCHY_ITM_ANABIO,
  BIOLOGY_HIERARCHY_ITM_LOINC,
  CLAIM_HIERARCHY,
  CONDITION_HIERARCHY,
  PROCEDURE_HIERARCHY
} from '../constants'

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
}

/**
 * fetchPmsi
 *
 */
type FetchPmsiParams = {
  options: {
    selectedTab: RessourceType.CLAIM | RessourceType.PROCEDURE | RessourceType.CONDITION
    page: number
    searchCriterias: SearchCriterias<PMSIFilters>
  }
  groupId?: string
  signal?: AbortSignal
}
type FetchPmsiReturn =
  | { condition: IPatientPmsi<Condition> }
  | { claim: IPatientPmsi<Claim> }
  | { procedure: IPatientPmsi<Procedure> }
  | undefined
const fetchPmsi = createAsyncThunk<FetchPmsiReturn, FetchPmsiParams, { state: RootState; rejectValue: any }>(
  'patient/fetchPmsi',
  async ({ groupId, options, signal }, thunkApi) => {
    try {
      const patientState = thunkApi.getState().patient
      const index = mapToAttribute(options.selectedTab)
      const currentPmsiState = patientState?.pmsi ? patientState?.pmsi[index] ?? { total: null } : { total: null }
      const WILDCARD = '*'

      const patientId = patientState?.patientInfo?.id ?? ''
      if (!patientId) {
        throw new Error('Patient Error: patient is required')
      }
      const deidentified = patientState?.deidentified ?? true
      const hospits = patientState?.hospits?.list ?? []
      const selectedTab = options.selectedTab
      const sortBy = options.searchCriterias.orderBy.orderBy
      const sortDirection = options.searchCriterias.orderBy.orderDirection
      const page = options.page ?? 1
      const searchInput =
        options.searchCriterias.searchInput === '' ? '' : options.searchCriterias.searchInput + WILDCARD
      const codeUrl =
        selectedTab === RessourceType.CLAIM
          ? CLAIM_HIERARCHY
          : selectedTab === RessourceType.PROCEDURE
          ? PROCEDURE_HIERARCHY
          : CONDITION_HIERARCHY
      const code = options.searchCriterias.filters.code.map((e) => encodeURIComponent(`${codeUrl}|`) + e.id).join(',')
      const source = options.searchCriterias.filters.source ?? ''
      const diagnosticTypes = options.searchCriterias.filters.diagnosticTypes?.map((type) => type.id) ?? []
      const nda = options.searchCriterias.filters.nda
      const startDate = options.searchCriterias.filters.startDate
      const endDate = options.searchCriterias.filters.endDate
      const executiveUnits = options.searchCriterias.filters.executiveUnits.map((unit) => unit.id)

      const pmsiResponse = await services.patients.fetchPMSI(
        page,
        patientId,
        selectedTab,
        searchInput,
        nda,
        code,
        source,
        diagnosticTypes,
        sortBy,
        sortDirection,
        startDate,
        endDate,
        executiveUnits,
        groupId,
        signal
      )

      if (pmsiResponse.pmsiData === undefined) return undefined

      const pmsiList = linkElementWithEncounter(
        pmsiResponse.pmsiData as (Procedure | Condition | Claim)[],
        hospits,
        deidentified
      )

      const pmsiReturn = {
        loading: false,
        count: pmsiResponse.pmsiTotal ?? 0,
        total: currentPmsiState?.total ?? pmsiResponse.pmsiTotal ?? 0,
        list: pmsiList,
        page,
        options
      }

      switch (selectedTab) {
        case RessourceType.CONDITION:
          return { condition: pmsiReturn as IPatientPmsi<Condition> }
        case RessourceType.PROCEDURE:
          return { procedure: pmsiReturn as IPatientPmsi<Procedure> }
        case RessourceType.CLAIM:
          return { claim: pmsiReturn as IPatientPmsi<Claim> }
      }
    } catch (error) {
      if (error instanceof CanceledError) {
        return thunkApi.rejectWithValue({ error })
      } else {
        throw error
      }
    }
  }
)

/**
 * fetchBiology
 *
 */
export type FetchBiologyParams = {
  options: {
    page: number
    searchCriterias: SearchCriterias<BiologyFilters>
  }
  groupId?: string
  signal?: AbortSignal
}
type FetchBiologyReturn = undefined | { biology: IPatientObservation<CohortObservation> }
const fetchBiology = createAsyncThunk<FetchBiologyReturn, FetchBiologyParams, { state: RootState; rejectValue: any }>(
  'patient/fetchBiology',
  async ({ groupId, options, options: { page, searchCriterias }, signal }, thunkApi) => {
    try {
      const patientState = thunkApi.getState().patient

      const patientId = patientState?.patientInfo?.id ?? ''
      if (!patientId) {
        throw new Error('Patient Error: patient is required')
      }

      const deidentified = patientState?.deidentified ?? true
      const hospits = patientState?.hospits?.list ?? []

      const sortBy = searchCriterias.orderBy.orderBy
      const sortDirection = searchCriterias.orderBy.orderDirection
      const searchInput = searchCriterias.searchInput
      const nda = searchCriterias.filters.nda
      const loinc = searchCriterias.filters.loinc
        .map((e) => encodeURIComponent(`${BIOLOGY_HIERARCHY_ITM_LOINC}|`) + e.id)
        .join(',')
      const anabio = searchCriterias.filters.anabio
        .map((e) => encodeURIComponent(`${BIOLOGY_HIERARCHY_ITM_ANABIO}|`) + e.id)
        .join(',')
      const startDate = searchCriterias.filters.startDate
      const endDate = searchCriterias.filters.endDate
      const executiveUnits = searchCriterias.filters.executiveUnits.map((unit) => unit.id)
      const rowStatus = searchCriterias.filters.validatedStatus

      const biologyResponse = await services.patients.fetchObservation(
        sortBy,
        sortDirection,
        page,
        patientId,
        rowStatus,
        searchInput,
        nda,
        loinc,
        anabio,
        startDate,
        endDate,
        groupId,
        signal,
        executiveUnits
      )

      const biologyList = linkElementWithEncounter(biologyResponse.biologyList, hospits, deidentified)

      return {
        biology: {
          loading: false,
          count: biologyResponse.biologyTotal,
          total: patientState?.biology?.total ? patientState?.biology?.total : biologyResponse.biologyTotal,
          list: biologyList,
          page,
          options
        } as IPatientObservation<CohortObservation>
      }
    } catch (error) {
      console.error(error)
      if (error instanceof CanceledError) {
        return thunkApi.rejectWithValue({ error })
      } else {
        throw error
      }
    }
  }
)

/**
 * fetchMedication
 *
 */
type FetchMedicationParams = {
  options: {
    selectedTab: RessourceType.MEDICATION_REQUEST | RessourceType.MEDICATION_ADMINISTRATION
    page: number
    searchCriterias: SearchCriterias<MedicationFilters>
  }
  groupId?: string
  signal?: AbortSignal
}
type FetchMedicationReturn =
  | { prescription: IPatientMedication<MedicationRequest> }
  | { administration: IPatientMedication<MedicationAdministration> }
  | undefined
const fetchMedication = createAsyncThunk<
  FetchMedicationReturn,
  FetchMedicationParams,
  { state: RootState; rejectValue: any }
>(
  'patient/fetchMedication',
  async ({ options, options: { selectedTab, page, searchCriterias }, groupId, signal }, thunkApi) => {
    try {
      const patientState = thunkApi.getState().patient

      const index = mapToAttribute(selectedTab)
      const currentMedicationState = patientState?.medication
        ? patientState?.medication[index] ?? { total: null }
        : { total: null }
      const patientId = patientState?.patientInfo?.id ?? ''
      if (!patientId) {
        throw new Error('Patient Error: patient is required')
      }
      const deidentified = patientState?.deidentified ?? true
      const hospits = patientState?.hospits?.list ?? []

      const sortBy = searchCriterias.orderBy.orderBy
      const sortDirection = searchCriterias.orderBy.orderDirection
      const searchInput = searchCriterias.searchInput
      const prescriptionTypes = searchCriterias.filters.prescriptionTypes?.map(({ id }) => id) ?? []
      const administrationRoutes = searchCriterias.filters.administrationRoutes?.map(({ id }) => id) ?? []
      const nda = searchCriterias.filters.nda
      const startDate = searchCriterias.filters?.startDate
      const endDate = searchCriterias.filters.endDate
      const executiveUnits = searchCriterias.filters.executiveUnits.map((unit) => unit.id)

      const medicationResponse = await services.patients.fetchMedication(
        page,
        patientId,
        selectedTab,
        sortBy,
        sortDirection,
        searchInput,
        nda,
        prescriptionTypes,
        administrationRoutes,
        startDate,
        endDate,
        executiveUnits,
        groupId,
        signal
      )

      if (medicationResponse.medicationData === undefined) return undefined

      const medicationList = linkElementWithEncounter(
        medicationResponse.medicationData as (MedicationRequest | MedicationAdministration)[],
        hospits,
        deidentified
      )

      const medicationReturn = {
        loading: false,
        count: medicationResponse.medicationTotal ?? 0,
        total: currentMedicationState?.total ?? medicationResponse.medicationTotal ?? 0,
        list: medicationList,
        page,
        options
      }

      switch (selectedTab) {
        case RessourceType.MEDICATION_REQUEST:
          return { prescription: medicationReturn as IPatientMedication<MedicationRequest> }
        case RessourceType.MEDICATION_ADMINISTRATION:
          return { administration: medicationReturn as IPatientMedication<MedicationAdministration> }
      }
    } catch (error) {
      console.error(error)
      if (error instanceof CanceledError) {
        return thunkApi.rejectWithValue({ error })
      }
      throw error
    }
  }
)

/**
 * fetchImaging
 *
 */
type FetchImagingParams = {
  options: {
    page: number
    searchCriterias: SearchCriterias<ImagingFilters>
  }
  groupId?: string
  signal?: AbortSignal
}
type FetchImagingReturn = undefined | { imaging: IPatientImaging<CohortImaging> }
const fetchImaging = createAsyncThunk<FetchImagingReturn, FetchImagingParams, { state: RootState; rejectValue: any }>(
  'patient/fetchImaging',
  async ({ options: { page, searchCriterias }, options, groupId, signal }, thunkApi) => {
    try {
      const patientState = thunkApi.getState().patient

      const patientId = patientState?.patientInfo?.id ?? ''
      if (!patientId) {
        throw new Error('Patient Error: patient is required')
      }

      const deidentified = patientState?.deidentified ?? true
      const hospits = patientState?.hospits?.list ?? []

      const orderBy = searchCriterias.orderBy.orderBy
      const orderDirection = searchCriterias.orderBy.orderDirection
      const nda = searchCriterias.filters.nda
      const searchInput = searchCriterias.searchInput
      const startDate = searchCriterias.filters.startDate
      const endDate = searchCriterias.filters.endDate
      const executiveUnits = searchCriterias.filters.executiveUnits.map((unit) => unit.id)
      const modalities = searchCriterias.filters.modality?.map(({ id }) => id)

      const imagingResponse = await services.patients.fetchImaging(
        orderBy,
        orderDirection,
        page,
        patientId,
        nda,
        searchInput,
        startDate,
        endDate,
        groupId,
        signal,
        modalities,
        executiveUnits
      )

      const imagingList = linkElementWithEncounter(imagingResponse.imagingList, hospits, deidentified)

      return {
        imaging: {
          loading: false,
          count: imagingResponse.imagingTotal,
          total: patientState?.imaging?.total ? patientState?.imaging?.total : imagingResponse.imagingTotal,
          list: imagingList,
          page,
          options
        } as IPatientImaging<CohortImaging>
      }
    } catch (error) {
      console.error(error)
      if (error instanceof CanceledError) {
        return thunkApi.rejectWithValue({ error })
      }
    }
  }
)
/**
 * fetchDocument
 *
 */
type FetchDocumentsParams = {
  options: {
    page: number
    searchCriterias: SearchCriterias<DocumentsFilters>
  }
  groupId?: string
  signal?: AbortSignal
}
type FetchDocumentsReturn = { documents?: IPatientDocuments } | undefined
const fetchDocuments = createAsyncThunk<
  FetchDocumentsReturn,
  FetchDocumentsParams,
  { state: RootState; rejectValue: any }
>('patient/fetchDocuments', async ({ signal, groupId, options, options: { page, searchCriterias } }, thunkApi) => {
  try {
    const patientState = thunkApi.getState().patient

    const patientId = patientState?.patientInfo?.id ?? ''
    if (!patientId) {
      throw new Error('Patient Error: patient is required')
    }
    const deidentified = patientState?.deidentified ?? true
    const hospits = patientState?.hospits?.list ?? []

    const sortBy = searchCriterias.orderBy.orderBy
    const sortDirection = searchCriterias.orderBy.orderDirection
    const searchInput = searchCriterias.searchInput
    const nda = searchCriterias.filters.nda
    const searchBy = searchCriterias.searchBy || SearchByTypes.TEXT
    const selectedDocTypes = searchCriterias.filters.docTypes.map((docType) => docType.code)
    const startDate = searchCriterias.filters.startDate
    const endDate = searchCriterias.filters.endDate
    const onlyPdfAvailable = searchCriterias.filters.onlyPdfAvailable
    const executiveUnits = searchCriterias.filters.executiveUnits.map((unit) => unit.id)

    if (searchInput) {
      const searchInputError = await services.cohorts.checkDocumentSearchInput(searchInput, signal)

      if (searchInputError && searchInputError.isError) {
        return {
          documents: {
            loading: false,
            count: 0,
            total: 0,
            list: [],
            page: 1,
            options,
            searchInputError: searchInputError
          } as IPatientDocuments
        }
      }
    }

    const documentsResponse = await services.patients.fetchDocuments(
      sortBy,
      sortDirection,
      searchBy,
      page,
      patientId,
      searchInput,
      selectedDocTypes,
      nda,
      onlyPdfAvailable,
      startDate,
      endDate,
      groupId,
      signal,
      executiveUnits
    )

    const documentsList = linkElementWithEncounter(
      documentsResponse.docsList as DocumentReference[],
      hospits,
      deidentified
    )

    return {
      documents: {
        loading: false,
        count: documentsResponse.docsTotal,
        total: patientState?.documents?.total ? patientState?.documents?.total : documentsResponse.docsTotal,
        list: documentsList,
        page,
        options
      } as IPatientDocuments
    }
  } catch (error) {
    console.error(error)
    if (error instanceof CanceledError) {
      return thunkApi.rejectWithValue({ error })
    }
  }
})

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
  patientId: string
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
  async ({ patientId, groupId }, { getState }) => {
    try {
      const patientState = getState().patient

      const hospits = patientState?.hospits?.list ?? []
      const deidentified = patientState?.deidentified ?? []

      const fetchPatientResponse = await Promise.all([
        services.patients.fetchPMSI(
          0,
          patientId,
          RessourceType.CONDITION,
          '',
          '',
          '',
          '',
          [],
          Order.DATE,
          Direction.DESC,
          null,
          null,
          [],
          groupId
        ),
        services.patients.fetchPMSI(
          0,
          patientId,
          RessourceType.PROCEDURE,
          '',
          '',
          '',
          '',
          [],
          Order.DATE,
          Direction.DESC,
          null,
          null,
          [],
          groupId
        ),
        services.patients.fetchPMSI(
          0,
          patientId,
          RessourceType.CLAIM,
          '',
          '',
          '',
          '',
          [],
          Order.DATE,
          Direction.DESC,
          null,
          null,
          [],
          groupId
        )
      ])

      if (fetchPatientResponse === undefined) return null

      const conditionList = linkElementWithEncounter(
        fetchPatientResponse[0].pmsiData as Condition[],
        hospits,
        deidentified
      )
      const procedureList = linkElementWithEncounter(
        fetchPatientResponse[1].pmsiData as Procedure[],
        hospits,
        deidentified
      )
      const claimList = linkElementWithEncounter(fetchPatientResponse[2].pmsiData as Claim[], hospits, deidentified)

      return {
        patientInfo: {
          lastGhm: claimList ? (claimList[0] as Claim) : undefined,
          lastProcedure: procedureList ? (procedureList[0] as Procedure) : undefined,
          mainDiagnosis: conditionList.filter(
            (condition: any) => condition.extension?.[0]?.valueCodeableConcept?.coding?.[0]?.code === 'dp'
          ) as Condition[]
        },
        pmsi: {
          condition: {
            loading: false,
            count: fetchPatientResponse[0].pmsiTotal ?? 0,
            total: fetchPatientResponse[0].pmsiTotal ?? 0,
            list: conditionList,
            page: 1
          },
          procedure: {
            loading: false,
            count: fetchPatientResponse[1].pmsiTotal ?? 0,
            total: fetchPatientResponse[1].pmsiTotal ?? 0,
            list: procedureList,
            page: 1
          },
          claim: {
            loading: false,
            count: fetchPatientResponse[2].pmsiTotal ?? 0,
            total: fetchPatientResponse[2].pmsiTotal ?? 0,
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
  hospits?: {
    loading: boolean
    list: (CohortEncounter | Encounter)[]
  }
} | null

const fetchPatientInfo = createAsyncThunk<FetchPatientReturn, FetchPatientParams, { state: RootState }>(
  'patient/fetchPatientInfo',
  async ({ patientId, groupId }, { getState, dispatch }) => {
    try {
      const patientState = getState().patient

      if (patientState && patientState.patientInfo && patientState.patientInfo.id === patientId) {
        return {
          patientInfo: patientState.patientInfo,
          deidentified: patientState.deidentified,
          hospits: patientState.hospits
        }
      }

      const fetchPatientResponse = await services.patients.fetchPatientInfo(patientId, groupId)
      if (fetchPatientResponse === undefined) return null

      const { patientInfo, hospits } = fetchPatientResponse
      let deidentifiedBoolean = true

      if (groupId) {
        deidentifiedBoolean = (await services.patients.fetchRights(groupId)) ?? {}
      } else {
        const perimeters = await services.perimeters.getPerimeters()

        if (!isCustomError(perimeters)) {
          deidentifiedBoolean = perimeters.some(
            (perimeter) => servicesPerimeters.getAccessFromScope(perimeter) === 'Pseudonymisé'
          )
        }
      }
      if (
        patientState?.patientInfo?.id !== patientId ||
        !patientState?.patientInfo?.lastGhm ||
        patientState?.patientInfo?.lastGhm === 'loading' ||
        !patientState?.patientInfo?.lastProcedure ||
        patientState?.patientInfo?.lastProcedure === 'loading' ||
        !patientState?.patientInfo?.mainDiagnosis ||
        patientState?.patientInfo?.mainDiagnosis === 'loading'
      ) {
        dispatch(fetchLastPmsiInfo({ patientId, groupId }))
      }

      return {
        patientInfo,
        deidentified: deidentifiedBoolean,
        hospits: {
          loading: false,
          list: hospits ?? []
        }
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
    // fetchPatientInfo
    builder.addCase(fetchPatientInfo.pending, (state) =>
      state === null
        ? {
            loading: true,
            patientInfo: {
              resourceType: RessourceType.PATIENT,
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
                  resourceType: RessourceType.PATIENT
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
            biology: undefined
          }
    )
    builder.addCase(fetchPatientInfo.rejected, () => null)
    builder.addCase(fetchLastPmsiInfo.pending, (state) =>
      state === null
        ? {
            loading: true,
            patientInfo: {
              resourceType: RessourceType.PATIENT,
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
                  resourceType: RessourceType.PATIENT,
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
                  resourceType: RessourceType.PATIENT,
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
            resourceType: RessourceType.PATIENT,
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
    builder.addCase(fetchDocuments.pending, (state) =>
      state === null
        ? null
        : {
            ...state,
            documents: state.documents
              ? {
                  ...state.documents,
                  loading: true
                }
              : undefined
          }
    )
    builder.addCase(fetchDocuments.fulfilled, (state, action) =>
      action.payload === undefined
        ? null
        : {
            ...state,
            loading: false,
            documents: action.payload.documents ?? undefined
          }
    )
    builder.addCase(fetchDocuments.rejected, (state) => ({
      ...state,
      loading: false
    }))
    builder.addCase(fetchPmsi.pending, (state) =>
      state === null
        ? null
        : {
            ...state,
            pmsi: state.pmsi
              ? {
                  ...state.pmsi,
                  condition: state.pmsi.condition
                    ? {
                        ...state.pmsi.condition,
                        loading: true
                      }
                    : undefined,
                  procedure: state.pmsi.procedure
                    ? {
                        ...state.pmsi.procedure,
                        loading: true
                      }
                    : undefined,
                  claim: state.pmsi.claim
                    ? {
                        ...state.pmsi.claim,
                        loading: true
                      }
                    : undefined
                }
              : {
                  condition: undefined,
                  procedure: undefined,
                  claim: undefined
                }
          }
    )
    builder.addCase(fetchPmsi.fulfilled, (state, action) =>
      action.payload === undefined || state === null
        ? null
        : {
            ...state,
            loading: false,
            pmsi: state.pmsi
              ? {
                  ...state.pmsi,
                  ...action.payload
                }
              : undefined
          }
    )
    builder.addCase(fetchPmsi.rejected, (state) => ({
      ...state,
      loading: false,
      pmsi: {
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
        },
        procedure: {
          loading: false,
          count: 0,
          total: 0,
          list: [],
          page: 0
        }
      }
    }))
    builder.addCase(fetchMedication.rejected, (state) => ({
      ...state,
      loading: false,
      medication: {
        administration: {
          loading: false,
          count: 0,
          total: 0,
          list: [],
          page: 0
        },
        prescription: {
          loading: false,
          count: 0,
          total: 0,
          list: [],
          page: 0
        }
      }
    }))
    builder.addCase(fetchMedication.pending, (state) =>
      state === null
        ? null
        : {
            ...state,
            medication: state.medication
              ? {
                  ...state.medication,
                  administration: state.medication.administration
                    ? {
                        ...state.medication.administration,
                        loading: true
                      }
                    : undefined,
                  prescription: state.medication.prescription
                    ? {
                        ...state.medication.prescription,
                        loading: true
                      }
                    : undefined
                }
              : {
                  administration: undefined,
                  prescription: undefined
                }
          }
    )
    builder.addCase(fetchMedication.fulfilled, (state, action) =>
      action.payload === undefined || state === null
        ? null
        : {
            ...state,
            loading: false,
            medication: state.medication
              ? {
                  ...state.medication,
                  ...action.payload
                }
              : undefined
          }
    )
    builder.addCase(fetchBiology.rejected, (state) => ({
      ...state,
      loading: false,
      biology: {
        loading: false,
        count: 0,
        total: 0,
        list: [],
        page: 0
      }
    }))
    builder.addCase(fetchBiology.pending, (state) =>
      state === null
        ? null
        : {
            ...state,
            biology: state.biology
              ? {
                  ...state.biology,
                  loading: true
                }
              : {
                  loading: true,
                  count: 0,
                  total: 0,
                  list: [],
                  page: 1
                }
          }
    )
    builder.addCase(fetchBiology.fulfilled, (state, action) =>
      action.payload === undefined
        ? null
        : {
            ...state,
            loading: false,
            biology: action.payload?.biology
          }
    )
    builder.addCase(fetchImaging.rejected, (state) => ({
      ...state,
      loading: false,
      imaging: {
        loading: false,
        count: 0,
        total: 0,
        list: [],
        page: 0
      }
    }))
    builder.addCase(fetchImaging.pending, (state) =>
      state === null
        ? null
        : {
            ...state,
            imaging: state.imaging
              ? {
                  ...state.imaging,
                  loading: true
                }
              : {
                  loading: true,
                  count: 0,
                  total: 0,
                  list: [],
                  page: 1
                }
          }
    )
    builder.addCase(fetchImaging.fulfilled, (state, action) =>
      action.payload === undefined
        ? null
        : {
            ...state,
            loading: false,
            imaging: action.payload?.imaging
          }
    )
  }
})

export default patientSlice.reducer
export {
  fetchPatientInfo,
  fetchLastPmsiInfo,
  fetchAllProcedures,
  fetchDocuments,
  fetchPmsi,
  fetchMedication,
  fetchBiology,
  fetchImaging
}
export const { clearPatient } = patientSlice.actions

function linkElementWithEncounter<
  T extends
    | Procedure
    | Condition
    | Claim
    | DocumentReference
    | MedicationRequest
    | MedicationAdministration
    | Observation
    | ImagingStudy
>(elementEntries: T[], encounterList: any[], deidentifiedBoolean: any) {
  let elementList: (T & {
    serviceProvider?: string
    NDA?: string
    documents?: any[]
  })[] = []

  for (const entry of elementEntries) {
    let newElement = entry as T & {
      serviceProvider?: string
      NDA?: string
      documents?: any[]
    }

    let encounterId = ''
    // @ts-ignore
    switch (entry.resourceType) {
      case RessourceType.CLAIM:
        encounterId = (entry as Claim).item?.[0].encounter?.[0].reference?.replace(/^Encounter\//, '') ?? ''
        break
      case RessourceType.PROCEDURE:
      case RessourceType.CONDITION:
        encounterId = (entry as Procedure | Condition).encounter?.reference?.replace(/^Encounter\//, '') ?? ''
        break
      case RessourceType.DOCUMENTS:
        encounterId = (entry as DocumentReference).context?.encounter?.[0].reference?.replace(/^Encounter\//, '') ?? ''
        break
      case RessourceType.MEDICATION_REQUEST:
        encounterId = (entry as MedicationRequest).encounter?.reference?.replace(/^Encounter\//, '') ?? ''
        break
      case RessourceType.MEDICATION_ADMINISTRATION:
        encounterId = (entry as MedicationAdministration).context?.reference?.replace(/^Encounter\//, '') ?? ''
        break
      case RessourceType.OBSERVATION:
        encounterId = (entry as Observation).encounter?.reference?.replace(/^Encounter\//, '') ?? ''
        break
      case RessourceType.IMAGING:
        encounterId = (entry as ImagingStudy).encounter?.reference?.replace(/^Encounter\//, '') ?? ''
        break
    }

    const foundEncounter = encounterList.find(({ id }) => id === encounterId) || null
    const foundEncounterWithDetails =
      // @ts-ignore
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
>(deidentifiedBoolean: boolean, element: T, encounter: any, encounterId: string, resourceType: string) {
  const newElement = element as T & {
    serviceProvider?: string
    NDA?: string
    documents?: any[]
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

  if (resourceType !== RessourceType.DOCUMENTS && encounter?.documents && encounter.documents.length > 0) {
    newElement.documents = encounter.documents
  }

  return newElement
}
