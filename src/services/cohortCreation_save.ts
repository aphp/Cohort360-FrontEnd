import api from './api'
import { CONTEXT } from '../constants'
import {
  IGroup,
  IPatient,
  IPractitioner,
  IGroup_Characteristic,
  IOperationOutcome,
  IGroup_Member
} from '@ahryman40k/ts-fhir-types/lib/R4'
import {
  InclusionCriteria,
  InclusionCriteriaTypes,
  PatientDemographyInclusionCriteria,
  MedicalDocumentInclusionCriteria,
  CIMDiagnosticInclusionCriteria,
  FHIR_API_Response
} from 'types'
import { getApiResponseResources } from 'utils/apiHelpers'
import {
  demographicCriterionToQuery,
  diagnosticsCriterionToQuery,
  filterWithDocumentSearch,
  criterionToCharacteristics
} from 'utils/fhirGroup'

export const buildFhirCohort = async (
  practitioner: IPractitioner,
  inclusionCriteria: InclusionCriteria[],
  populationSources: IGroup[],
  cohortName?: string
) => {
  if (CONTEXT === 'arkhn') {
    const demographicCriteria = inclusionCriteria.filter(
      (criterion): criterion is PatientDemographyInclusionCriteria =>
        criterion.type === InclusionCriteriaTypes.patientDemography
    )
    const documentCriteria = inclusionCriteria.filter(
      (criterion): criterion is MedicalDocumentInclusionCriteria =>
        criterion.type === InclusionCriteriaTypes.medicalDocument
    )
    const diagnosticsCriteria = inclusionCriteria.filter(
      (criterion): criterion is CIMDiagnosticInclusionCriteria =>
        criterion.type === InclusionCriteriaTypes.CIMDiagnostic
    )

    // Find patients in source populations
    // TODO make only 1 query for source and some of the criteria when API has more features
    const sourcePopulation = await Promise.all(
      populationSources.map((service) =>
        api.get<FHIR_API_Response<IPatient>>(
          `/Patient?_has:Encounter:subject:serviceProvider.reference=HealthcareService/${service.id}&_count=10000`
        )
      )
    )

    let memberIds = sourcePopulation
      .reduce((acc: IPatient[], populationResponse) => {
        const population = getApiResponseResources(populationResponse)
        return population ? [...acc, ...population] : acc
      }, [])
      .map((entry) => entry.id ?? '')
      .filter((id) => '' !== id)

    // Use demographic and diagnostic criteria
    const queryDemographic = demographicCriteria.map(demographicCriterionToQuery)
    const queryDiagnostics = diagnosticsCriteria.map(diagnosticsCriterionToQuery)
    const queryResponse = await api.get<FHIR_API_Response<IPatient>>(
      `/Patient?${[...queryDemographic, ...queryDiagnostics].join('&')}&_count=10000`
    )

    const queryPatients = getApiResponseResources(queryResponse)
    memberIds = queryPatients
      ? queryPatients
          .filter((member) => (member.id ? memberIds.includes(member.id) : false))
          .map((patient) => patient.id ?? '')
          .filter((id) => '' !== id)
      : []

    // Use document search criteria to filter out some patients
    for (const criterion of documentCriteria) {
      memberIds = await filterWithDocumentSearch(criterion, memberIds)
    }

    // FIXME we won't want random dates after the demo
    const randomDate = () => {
      const start = new Date(2012, 0, 1)
      const end = new Date()
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    }

    const members = memberIds.map((memberId) => ({
      entity: { reference: `Patient/${memberId}` },
      period: { start: randomDate().toISOString().split('T')[0] }
    }))

    const cohort: IGroup = {
      resourceType: 'Group',
      meta: {
        lastUpdated: new Date().toISOString()
      },
      name: cohortName
        ? cohortName
        : `Cohorte de ${practitioner.name?.[0].given?.[0]} ${
            practitioner.name?.[0].family
          } du ${new Date().toLocaleDateString('fr-FR')}`,
      managingEntity: {
        reference: `Practitioner/${practitioner.id}`
      },
      characteristic: inclusionCriteria.reduce(
        (acc: IGroup_Characteristic[], criterion) => [...acc, ...criterionToCharacteristics(criterion)],
        []
      ),
      ...(members && { member: members })
    }
    // Post group to api
    const groupResp = await api.post<IOperationOutcome | IGroup>('/Group', cohort)
    return groupResp.data
  }
}

export const patchCohortMembers = async (params: {
  includedPatients: IGroup_Member[]
  excludedPatients: IGroup_Member[]
  cohort: IGroup
}): Promise<IGroup_Member[]> => {
  const { includedPatients, excludedPatients, cohort } = params
  let newMembers = [...cohort.member]

  const excludedReferences = excludedPatients.map((p) => `Patient/${p.id}`)
  newMembers = newMembers.filter((member) =>
    member.entity.reference ? !excludedReferences.includes(member.entity.reference) : false
  )

  // For Group resource
  newMembers = [
    ...newMembers,
    ...includedPatients.map((p) => ({
      entity: { reference: `Patient/${p.id}` },
      period: { start: new Date().toISOString().split('T')[0] }
    }))
  ]

  await api.patch(`/Group/${cohort.id}`, { member: newMembers })
  return newMembers
}
