import api from '../apiFhir'
import { CONTEXT, API_RESOURCE_TAG } from '../../constants'
import { IComposition, IPatient, IEncounter, IIdentifier } from '@ahryman40k/ts-fhir-types/lib/R4'
import { CohortComposition, FHIR_API_Response, CohortData } from 'types'
import { getApiResponseResources } from 'utils/apiHelpers'
import {
  getGenderRepartitionMap,
  getGenderRepartitionMapAphp,
  getAgeRepartitionMap,
  getAgeRepartitionMapAphp,
  getEncounterRepartitionMap,
  getEncounterRepartitionMapAphp,
  getVisitRepartitionMap,
  getVisitRepartitionMapAphp
} from 'utils/graphUtils'

const getPatientInfos = async (deidentifiedBoolean: boolean, documents?: IComposition[], groupId?: string) => {
  if (!documents) {
    return []
  }
  const cohortDocuments = documents as CohortComposition[]

  const listePatientsIds = cohortDocuments.map((e) => e.subject?.display?.substring(8)).join()

  const groupFilter = groupId ? `&_list=${groupId}` : ''
  const patients = await api.get<FHIR_API_Response<IPatient>>(
    `/Patient?_id=${listePatientsIds}&_elements=extension,id,identifier${groupFilter}`
  )

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
  }

  return cohortDocuments
}

export const fetchMyPatients = async (): Promise<CohortData | undefined> => {
  if (CONTEXT === 'aphp') {
    const [myPatientsResp, myPatientsEncounters] = await Promise.all([
      api.get<FHIR_API_Response<IPatient>>(
        '/Patient?pivotFacet=age_gender,deceased_gender&size=20&_sort=given&_elements=gender,name,birthDate,deceased,identifier,extension'
      ),
      api.get<FHIR_API_Response<IEncounter>>('/Encounter?facet=class,visit-year-month-gender-facet&size=0&type=VISIT')
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
  }

  if (CONTEXT === 'arkhn') {
    const cohortData: CohortData = {
      name: 'Mes Patients'
    }
    const patients = getApiResponseResources(
      await api.get<FHIR_API_Response<IPatient>>(`/Patient?_count=700${API_RESOURCE_TAG}`)
    )

    if (patients && patients.length > 0) {
      cohortData.totalPatients = patients.length
      cohortData.originalPatients = patients
      cohortData.agePyramidData = getAgeRepartitionMap(patients)
      cohortData.genderRepartitionMap = getGenderRepartitionMap(patients)

      const patientsIds = patients.map((p) => p.id ?? '').filter(Boolean)
      const encounters = getApiResponseResources(
        await api.get<FHIR_API_Response<IEncounter>>(
          `/Encounter?subject:Patient=${patientsIds.join(',')}&_count=700${API_RESOURCE_TAG}`
        )
      )
      if (encounters) {
        cohortData.encounters = encounters
        cohortData.monthlyVisitData = getVisitRepartitionMap(patients, encounters)
        cohortData.visitTypeRepartitionData = getEncounterRepartitionMap(encounters)
      }
    }
    return cohortData
  }
}

const getEncounterInfos = async (deidentifiedBoolean: boolean, documents?: IComposition[], groupId?: string) => {
  if (!documents) {
    return []
  }

  const cohortDocuments = documents as CohortComposition[]
  const listeEncounterIds = cohortDocuments.map((e) => e.encounter?.display?.substring(10)).join()

  const groupFilter = groupId ? `&_list=${groupId}` : ''

  const encounters = await api.get<FHIR_API_Response<IEncounter>>(
    `/Encounter?_id=${listeEncounterIds}&type=VISIT&_elements=status,serviceProvider,identifier${groupFilter}`
  )

  if (encounters.data.resourceType !== 'Bundle' || !encounters.data.entry) {
    return []
  }

  const listeEncounters = encounters.data.entry.map((e: any) => e.resource)

  for (const document of cohortDocuments) {
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

export const getInfos = async (deidentifiedBoolean: boolean, documents?: IComposition[], groupId?: string) => {
  const docsComplets = await getPatientInfos(deidentifiedBoolean, documents, groupId)

  await getEncounterInfos(deidentifiedBoolean, docsComplets, groupId)

  return docsComplets
}
