import CIMTypes from 'data/CIMTypes'
import criteriaSearchFields from 'data/criteriaSearchField'
import genders from 'data/gender'
import api from 'services/apiFhir'
import {
  CIMDiagnosticInclusionCriteria,
  PatientDemographyInclusionCriteria,
  MedicalDocumentInclusionCriteria,
  FHIR_API_Response,
  InclusionCriteria,
  InclusionCriteriaTypes
} from 'types'
import { PatientGenderKind, IDocumentReference, IGroup_Characteristic } from '@ahryman40k/ts-fhir-types/lib/R4'
import { getApiResponseResources } from './apiHelpers'

export const criterionToCharacteristics = (criterion: InclusionCriteria) => {
  let characteristics: IGroup_Characteristic[] = []
  switch (criterion.type) {
    case InclusionCriteriaTypes.patientDemography:
      if (criterion.gender !== PatientGenderKind._unknown) {
        // Characteristic for gender
        characteristics.push({
          code: { coding: [{ code: '46098-0', display: 'Sex' }] },
          valueCodeableConcept: {
            coding: [
              {
                code: genders.find((gender) => gender.id === criterion.gender)?.fhir,
                system: 'http://hl7.org/fhir/administrative-gender'
              }
            ]
          }
        })
      }
      if (criterion.ageMin !== 0 || criterion.ageMax !== 100) {
        // Characteristic for age
        characteristics.push({
          code: {
            coding: [{ code: '63900-5', display: 'Current age or age at death' }]
          },
          valueRange: {
            ...(criterion.ageMin !== 0 && {
              low: {
                value: criterion.ageMin,
                code: 'a',
                system: 'http://unitsofmeasure.org/'
              }
            }),
            ...(criterion.ageMax !== 100 && {
              high: {
                value: criterion.ageMax,
                code: 'a',
                system: 'http://unitsofmeasure.org/'
              }
            })
          }
        })
      }
      break
    case 'Diagnostic CIM':
      // Characteristic for CIM
      characteristics = [
        {
          code: {
            coding: [{ code: '86255-7', display: 'Primary diagnosis ICD code' }]
          },
          valueCodeableConcept: {
            coding: [
              {
                code: criterion.CIMDiagnosis['DIAGNOSIS CODE'],
                system: CIMTypes.find((type) => type.id === criterion.CIMTypeId)?.system
              }
            ]
          }
        }
      ]
      break
    case 'Document médical':
      // Characteristic for document search
      characteristics = [
        {
          code: {
            coding: [
              {
                code: criterion.searchFieldCode,
                display: criteriaSearchFields.find((field) => field.code === criterion.searchFieldCode)?.display
              }
            ]
          },
          valueCodeableConcept: {
            text: criterion.searchValue
          }
        }
      ]
      break
    default:
      console.debug('criterion type not supported')
      console.debug(criterion)
  }
  return characteristics
}

export const diagnosticsCriterionToQuery = (criterion: CIMDiagnosticInclusionCriteria) => {
  return `_has:DiagnosticReport:subject:code.coding.code=${criterion.CIMDiagnosis['DIAGNOSIS CODE']}`
}

export const demographicCriterionToQuery = (criterion: PatientDemographyInclusionCriteria) => {
  const params: string[] = []
  const now = new Date()
  const month = ('0' + (now.getUTCMonth() + 1)).slice(-2)
  const day = ('0' + now.getUTCDate()).slice(-2)

  if (criterion.gender !== PatientGenderKind._unknown) {
    params.push(`gender=${genders.find((gender) => gender.id === criterion.gender)?.fhir}`)
  }
  if (criterion.ageMin !== 0) {
    const ref = `${now.getUTCFullYear() - criterion.ageMin}-${month}-${day}`
    params.push(`birthDate=le${ref}`)
  }
  if (criterion.ageMax !== 100) {
    const ref = `${now.getUTCFullYear() - criterion.ageMax}-${month}-${day}`
    params.push(`birthDate=ge${ref}`)
  }

  return params.join('&')
}

export const filterWithDocumentSearch = async (
  criterion: MedicalDocumentInclusionCriteria,
  references: string[]
): Promise<string[]> => {
  const response = await api.get<FHIR_API_Response<IDocumentReference>>(
    `/DocumentReference?$search=${criterion.searchValue}`
  )
  const documentsRefs = getApiResponseResources(response)

  if (!documentsRefs) {
    return []
  }

  const filteredReferences = documentsRefs
    .map((docRef) => docRef.subject?.reference?.replace('Patient/', ''))
    .filter((ref): ref is string => undefined !== ref)

  return references.filter((ref) => filteredReferences.includes(ref))
}
