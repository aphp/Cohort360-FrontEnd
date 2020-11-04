import CIMTypes from '../data/CIMTypes'
import criteriaSearchFields from '../data/criteriaSearchField'
import genders from '../data/gender'
import api from '../services/api'

export const criterionToCharacteristics = (criterion) => {
  let characteristics = []
  switch (criterion.type) {
    case 'Démographie patient':
      if (criterion.genderId !== '3') {
        // Characteristic for gender
        characteristics = [
          {
            code: { coding: [{ code: '46098-0', display: 'Sex' }] },
            valueCodeableConcept: {
              coding: [
                {
                  code: genders.find(
                    (gender) => gender.id === criterion.genderId
                  ).fhir,
                  system: 'http://hl7.org/fhir/administrative-gender'
                }
              ]
            }
          }
        ]
      }
      if (criterion.ageMin !== 0 || criterion.ageMax !== 100) {
        // Characteristic for age
        characteristics = [
          ...characteristics,
          {
            code: {
              coding: [
                { code: '63900-5', display: 'Current age or age at death' }
              ]
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
          }
        ]
      }
      break
    case 'Diagnostiques CIM':
      // Characteristic for CIM
      characteristics = [
        {
          code: {
            coding: [{ code: '86255-7', display: 'Primary diagnosis ICD code' }]
          },
          valueCodeableConcept: {
            coding: [
              {
                code: criterion.CIMDiagnosis,
                system: CIMTypes.find((type) => type.id === criterion.CIMTypeId)
                  .system
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
                display: criteriaSearchFields.find(
                  (field) => field.code === criterion.searchFieldCode
                ).display
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

export const diagnosticsCriterionToQuery = (criterion) =>
  `?_has:DiagnosticReport:subject:code.coding.code=${criterion.CIMDiagnosis}`

export const demographicCriterionToQuery = (criterion) => {
  let params = []
  const now = new Date()
  const month = ('0' + (now.getUTCMonth() + 1)).slice(-2)
  const day = ('0' + now.getUTCDate()).slice(-2)

  if (criterion.genderId !== '3') {
    params = [
      `gender=${
        genders.find((gender) => gender.id === criterion.genderId).fhir
      }`
    ]
  }
  if (criterion.ageMin !== 0) {
    const ref = `${now.getUTCFullYear() - criterion.ageMin}-${month}-${day}`
    params = [...params, `birthDate=le${ref}`]
  }
  if (criterion.ageMax !== 100) {
    const ref = `${now.getUTCFullYear() - criterion.ageMax}-${month}-${day}`
    params = [...params, `birthDate=ge${ref}`]
  }

  return params.join('&')
}

export const filterWithDocumentSearch = async (criterion, references) => {
  const response = await api.get(
    `/DocumentReference?$search=${criterion.searchValue}`
  )
  const filteredReferences = response.data.entry.map((entry) =>
    entry.resource.subject.reference.replace('Patient/', '')
  )
  return references.filter((ref) => filteredReferences.includes(ref))
}
