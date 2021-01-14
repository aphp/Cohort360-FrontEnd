import moment from 'moment'

import { fetchPerimeterInfoForRequeteur as fetchPopulation } from '../services/perimeters'
import { ScopeTreeRow, SelectedCriteriaType } from 'types'

const RESSOURCE_TYPE_PATIENT: 'Patient' = 'Patient'
const PATIENT_GENDER = 'gender' // ok
const PATIENT_BIRTHDATE = 'birthdate' // ok
const PATIENT_DECEASED = 'deceased' // ok

const RESSOURCE_TYPE_ENCOUNTER: 'Encounter' = 'Encounter'
const ENCOUNTER_LENGTH = 'length' // ok
const ENCOUNTER_BIRTHDATE = 'patient.birthdate' // ok
const ENCOUNTER_ADMISSIONMODE = 'admissionMode' // on verra
const ENCOUNTER_ENTRYMODE = 'entryMode' // on verra
const ENCOUNTER_EXITMODE = 'exitMode' // on verra
const ENCOUNTER_FILESTATUS = 'fileStatus' // on verra

const RESSOURCE_TYPE_CLAIM: 'Claim' = 'Claim'
const CLAIM_CODE = 'diagnosis' // ok
const CLAIM_DATE = 'created' // ok
const CLAIM_ENCOUNTER = 'encounter' // on verra

const RESSOURCE_TYPE_PROCEDURE: 'Procedure' = 'Procedure'
const PROCEDURE_CODE = 'code' // ok
const PROCEDURE_DATE = 'date' // ok
const PROCEDURE_ENCOUNTER = 'encounter' // on verra

const RESSOURCE_TYPE_CONDITION: 'Condition' = 'Condition' // ok
const CONDITION_CODE = 'code' // ok
const CONDITION_TYPE = 'type' // ok
const CONDITION_DATE = 'recorded-date' // ok
const CONDITION_ENCOUNTER = 'encounter' // on verra

const RESSOURCE_TYPE_COMPOSITION: 'Composition' = 'Composition'
const COMPOSITION_TEXT = '_text' // ok
const COMPOSITION_TYPE = 'type' // ok
const COMPOSITION_DATE = 'date' // ok
const COMPOSITION_ENCOUNTER = 'encounter' // on verra
type RequeteurSearchType = {
  _type: string
  resourceType:
    | typeof RESSOURCE_TYPE_PATIENT
    | typeof RESSOURCE_TYPE_ENCOUNTER
    | typeof RESSOURCE_TYPE_CLAIM
    | typeof RESSOURCE_TYPE_PROCEDURE
    | typeof RESSOURCE_TYPE_CONDITION
    | typeof RESSOURCE_TYPE_COMPOSITION
  fhirFilter: string
}

export function buildRequest(selectedPopulation: any, selectedCriteria: any) {
  if (!selectedPopulation) return ''

  const filterReducer = (accumulator: any, currentValue: any) =>
    accumulator ? `${accumulator}&${currentValue}` : currentValue ? currentValue : accumulator
  // Preparation du multi requete, par ex: gender = m + f + other
  const searchReducer = (accumulator: any, currentValue: any) =>
    accumulator ? `${accumulator},${currentValue}` : currentValue ? currentValue : accumulator

  let newJson: RequeteurSearchType[] = [
    {
      _type: 'resource',
      resourceType: RESSOURCE_TYPE_PATIENT,
      fhirFilter: `_list=${selectedPopulation
        .map((selectedPopulation: any) => selectedPopulation.id)
        .reduce(searchReducer)}`
    }
  ]

  for (const selectedCriterion of selectedCriteria) {
    let fhirFilter = ''

    switch (selectedCriterion.type) {
      case RESSOURCE_TYPE_PATIENT: {
        let ageFilter = ''
        if (selectedCriterion.years && selectedCriterion.years !== [0, 100]) {
          const date1 = moment().subtract(selectedCriterion.years[1], 'years').format('YYYY-MM-DD')
          const date2 = moment().subtract(selectedCriterion.years[0], 'years').format('YYYY-MM-DD')
          ageFilter = `${PATIENT_BIRTHDATE}=ge${date1},le${date2}`
        }

        fhirFilter = [
          `${selectedCriterion.gender ? `${PATIENT_GENDER}=${selectedCriterion.gender.id}` : ''}`,
          `${selectedCriterion.vitalStatus ? `${PATIENT_DECEASED}=${selectedCriterion.vitalStatus.id}` : ''}`,
          `${ageFilter ? `${ageFilter}` : ''}`
        ]
          .filter((elem) => elem)
          .reduce(filterReducer)
        break
      }

      case RESSOURCE_TYPE_ENCOUNTER: {
        let lengthFilter = ''
        if (selectedCriterion.duration && selectedCriterion.duration !== [0, 100]) {
          lengthFilter = `${ENCOUNTER_LENGTH}=ge${selectedCriterion.duration[0]},le${selectedCriterion.duration[1]}`
        }

        let ageFilter = ''
        if (selectedCriterion.years && selectedCriterion.years !== [0, 100]) {
          const date1 = moment()
            .subtract(selectedCriterion.years[1], selectedCriterion?.ageType?.id)
            .format('YYYY-MM-DD')
          const date2 = moment()
            .subtract(selectedCriterion.years[0], selectedCriterion?.ageType?.id)
            .format('YYYY-MM-DD')
          ageFilter = `${ENCOUNTER_BIRTHDATE}=ge${date1},le${date2}`
        }

        fhirFilter = [
          `${
            selectedCriterion.admissionMode ? `${ENCOUNTER_ADMISSIONMODE}=${selectedCriterion.admissionMode.id}` : ''
          }`,
          `${selectedCriterion.entryMode ? `${ENCOUNTER_ENTRYMODE}=${selectedCriterion.entryMode.id}` : ''}`,
          `${selectedCriterion.exitMode ? `${ENCOUNTER_EXITMODE}=${selectedCriterion.exitMode.id}` : ''}`,
          `${selectedCriterion.fileStatus ? `${ENCOUNTER_FILESTATUS}=${selectedCriterion.fileStatus.id}` : ''}`,
          `${lengthFilter ? `${lengthFilter}` : ''}`,
          `${ageFilter ? `${ageFilter}` : ''}`
        ]
          .filter((elem) => elem)
          .reduce(filterReducer)
        break
      }

      case RESSOURCE_TYPE_COMPOSITION: {
        let dateFilter = ''
        if (selectedCriterion.startOccurrence || selectedCriterion.endOccurrence) {
          dateFilter = [
            selectedCriterion.startOccurrence
              ? `ge${moment(selectedCriterion.startOccurrence).format('YYYY-MM-DD')}`
              : '',
            selectedCriterion.endOccurrence ? `le${moment(selectedCriterion.endOccurrence).format('YYYY-MM-DD')}` : ''
          ].reduce(searchReducer)
        }

        fhirFilter = [
          `${selectedCriterion.search ? `${COMPOSITION_TEXT}=${selectedCriterion.search}` : ''}`,
          `${selectedCriterion.docType ? `${COMPOSITION_TYPE}=${selectedCriterion.docType.id}` : ''}`,
          `${selectedCriterion.encounter ? `${COMPOSITION_ENCOUNTER}=${selectedCriterion.encounter}` : ''}`,
          `${dateFilter ? `${COMPOSITION_DATE}=${dateFilter}` : ''}`
        ]
          .filter((elem) => elem)
          .reduce(filterReducer)
        break
      }

      case RESSOURCE_TYPE_CONDITION: {
        let dateFilter = ''
        if (selectedCriterion.startOccurrence || selectedCriterion.endOccurrence) {
          dateFilter = [
            selectedCriterion.startOccurrence
              ? `ge${moment(selectedCriterion.startOccurrence).format('YYYY-MM-DD')}`
              : '',
            selectedCriterion.endOccurrence ? `le${moment(selectedCriterion.endOccurrence).format('YYYY-MM-DD')}` : ''
          ].reduce(searchReducer)
        }

        fhirFilter = [
          `${selectedCriterion.code ? `${CONDITION_CODE}=${selectedCriterion.code.id}` : ''}`,
          `${selectedCriterion.diagnosticType ? `${CONDITION_TYPE}=${selectedCriterion.diagnosticType.id}` : ''}`,
          `${selectedCriterion.encounter ? `${CONDITION_ENCOUNTER}=${selectedCriterion.encounter}` : ''}`,
          `${dateFilter ? `${CONDITION_DATE}=${dateFilter}` : ''}`
        ]
          .filter((elem) => elem)
          .reduce(filterReducer)
        break
      }

      case RESSOURCE_TYPE_PROCEDURE: {
        let dateFilter = ''
        if (selectedCriterion.startOccurrence || selectedCriterion.endOccurrence) {
          dateFilter = [
            selectedCriterion.startOccurrence
              ? `ge${moment(selectedCriterion.startOccurrence).format('YYYY-MM-DD')}`
              : '',
            selectedCriterion.endOccurrence ? `le${moment(selectedCriterion.endOccurrence).format('YYYY-MM-DD')}` : ''
          ].reduce(searchReducer)
        }

        fhirFilter = [
          `${selectedCriterion.code ? `${PROCEDURE_CODE}=${selectedCriterion.code.id}` : ''}`,
          `${selectedCriterion.encounter ? `${PROCEDURE_ENCOUNTER}=${selectedCriterion.encounter}` : ''}`,
          `${dateFilter ? `${PROCEDURE_DATE}=${dateFilter}` : ''}`
        ]
          .filter((elem) => elem)
          .reduce(filterReducer)
        break
      }

      case RESSOURCE_TYPE_CLAIM: {
        let dateFilter = ''
        if (selectedCriterion.startOccurrence || selectedCriterion.endOccurrence) {
          dateFilter = [
            `${
              selectedCriterion.startOccurrence
                ? `ge${moment(selectedCriterion.startOccurrence).format('YYYY-MM-DD')}`
                : ''
            }`,
            `${
              selectedCriterion.endOccurrence ? `le${moment(selectedCriterion.endOccurrence).format('YYYY-MM-DD')}` : ''
            }`
          ].reduce(searchReducer)
        }

        fhirFilter = [
          `${selectedCriterion.code ? `${CLAIM_CODE}=${selectedCriterion.code.id}` : ''}`,
          `${selectedCriterion.encounter ? `${CLAIM_ENCOUNTER}=${selectedCriterion.encounter}` : ''}`,
          `${dateFilter ? `${CLAIM_DATE}=${dateFilter}` : ''}`
        ]
          .filter((elem) => elem)
          .reduce(filterReducer)
        break
      }

      default:
        break
    }

    newJson = [
      ...newJson,
      {
        _type: 'resource',
        resourceType: selectedCriterion.type,
        fhirFilter
      }
    ]
  }

  const newJsonReducer = (accumulator: any, currentValue: any) =>
    accumulator
      ? {
          _type: 'InnerJoin',
          child: [accumulator, currentValue]
        }
      : currentValue
  const requeteurJson:
    | { _type: 'InnerJoin'; child: [RequeteurSearchType, RequeteurSearchType] }
    | RequeteurSearchType
    | null = newJson && newJson.length > 0 ? newJson.reduce(newJsonReducer) : null
  return JSON.stringify(requeteurJson)
}

export async function unbuildRequest(json: string) {
  let population: ScopeTreeRow[] | null = null
  let criteria: SelectedCriteriaType[] = []

  const _retrieveInformationFromJson = async (element: RequeteurSearchType) => {
    const currentCriterion: any = {
      type: element.resourceType,
      title: ''
    }
    switch (element.resourceType) {
      case RESSOURCE_TYPE_PATIENT: {
        if (element.fhirFilter) {
          const filters = element.fhirFilter.split('&').map((elem) => elem.split('='))
          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            if (key === '_list') {
              population = await fetchPopulation(value ?? '')
              return
            } else {
              currentCriterion.title = 'Critère démographique'
              currentCriterion.years = currentCriterion.years ? currentCriterion.years : null
              currentCriterion.gender = currentCriterion.gender ? currentCriterion.gender : null
              currentCriterion.vitalStatus = currentCriterion.vitalStatus ? currentCriterion.vitalStatus : null
              switch (key) {
                case PATIENT_BIRTHDATE: {
                  const dateValues = value?.split(',')
                  const date2 = dateValues ? moment(dateValues[0].replace(/[le|ge]/, ''), 'YYYY-MM-DD') : null
                  const date1 = dateValues ? moment(dateValues[1].replace(/[ge|le]/, ''), 'YYYY-MM-DD') : null
                  currentCriterion.years = [
                    date1 ? moment().diff(date1, 'years') : 0,
                    date2 ? moment().diff(date2, 'years') : 100
                  ]
                  break
                }
                case PATIENT_GENDER:
                  currentCriterion.gender = { id: value }
                  break
                case PATIENT_DECEASED:
                  currentCriterion.vitalStatus = { id: !!value }
                  break
                default:
                  break
              }
            }
          }
        }
        break
      }
      case RESSOURCE_TYPE_ENCOUNTER: {
        if (element.fhirFilter) {
          const filters = element.fhirFilter.split('&').map((elem) => elem.split('='))

          currentCriterion.title = 'Critère de prise en charge'
          currentCriterion.duration = currentCriterion.duration ? currentCriterion.duration : null
          currentCriterion.admissionMode = currentCriterion.admissionMode ? currentCriterion.admissionMode : null
          currentCriterion.entryMode = currentCriterion.entryMode ? currentCriterion.entryMode : null
          currentCriterion.exitMode = currentCriterion.exitMode ? currentCriterion.exitMode : null
          currentCriterion.fileStatus = currentCriterion.fileStatus ? currentCriterion.fileStatus : null

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            switch (key) {
              case ENCOUNTER_LENGTH: {
                const lengthValues = value?.split(',')
                currentCriterion.duration = [
                  lengthValues ? lengthValues[0].replace(/[le|ge]/, '') : 0,
                  lengthValues ? lengthValues[1].replace(/[ge|le]/, '') : 0
                ]
                break
              }
              case ENCOUNTER_ADMISSIONMODE:
                currentCriterion.admissionMode = { id: value }
                break
              case ENCOUNTER_ENTRYMODE:
                currentCriterion.entryMode = { id: value }
                break
              case ENCOUNTER_EXITMODE:
                currentCriterion.exitMode = { id: value }
                break
              case ENCOUNTER_FILESTATUS:
                currentCriterion.fileStatus = { id: value }
                break

              default:
                break
            }
          }
        }
        break
      }
      case RESSOURCE_TYPE_COMPOSITION: {
        if (element.fhirFilter) {
          const filters = element.fhirFilter.split('&').map((elem) => elem.split('='))

          currentCriterion.title = 'Critère de document'
          currentCriterion.search = currentCriterion.search ? currentCriterion.search : null
          currentCriterion.docType = currentCriterion.docType ? currentCriterion.docType : null
          currentCriterion.encounter = currentCriterion.encounter ? currentCriterion.encounter : null
          currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
          currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            switch (key) {
              case COMPOSITION_TEXT:
                currentCriterion.search = value
                break
              case COMPOSITION_TYPE:
                currentCriterion.docType = { id: value }
                break
              case COMPOSITION_ENCOUNTER:
                currentCriterion.encounter = value
                break
              case COMPOSITION_DATE: {
                const dates = value?.split(',')
                const startOccurrence = dates ? moment(dates[0].replace(/[le|ge]/, ''), 'YYYY-MM-DD') : null
                const endOccurrence = dates ? moment(dates[1].replace(/[ge|le]/, ''), 'YYYY-MM-DD') : null

                currentCriterion.startOccurrence = startOccurrence
                currentCriterion.endOccurrence = endOccurrence
                break
              }
              default:
                break
            }
          }
        }
        break
      }
      case RESSOURCE_TYPE_CONDITION: {
        if (element.fhirFilter) {
          const filters = element.fhirFilter.split('&').map((elem) => elem.split('='))

          currentCriterion.title = 'Critère de diagnostic'
          currentCriterion.code = currentCriterion.code ? currentCriterion.code : null
          currentCriterion.diagnosticType = currentCriterion.diagnosticType ? currentCriterion.diagnosticType : null
          currentCriterion.encounter = currentCriterion.encounter ? currentCriterion.encounter : null
          currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
          currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            switch (key) {
              case CONDITION_CODE:
                currentCriterion.code = { id: value }
                break
              case CONDITION_TYPE:
                currentCriterion.diagnosticType = { id: value }
                break
              case CONDITION_ENCOUNTER:
                currentCriterion.encounter = value
                break
              case CONDITION_DATE: {
                const dates = value?.split(',')
                const startOccurrence = dates ? moment(dates[0].replace(/[le|ge]/, ''), 'YYYY-MM-DD') : null
                const endOccurrence = dates ? moment(dates[1].replace(/[ge|le]/, ''), 'YYYY-MM-DD') : null

                currentCriterion.startOccurrence = startOccurrence
                currentCriterion.endOccurrence = endOccurrence
                break
              }
              default:
                break
            }
          }
        }
        break
      }
      case RESSOURCE_TYPE_PROCEDURE: {
        if (element.fhirFilter) {
          const filters = element.fhirFilter.split('&').map((elem) => elem.split('='))

          currentCriterion.title = "Critères d'actes CCAM"
          currentCriterion.code = currentCriterion.code ? currentCriterion.code : null
          currentCriterion.diagnosticType = currentCriterion.diagnosticType ? currentCriterion.diagnosticType : null
          currentCriterion.encounter = currentCriterion.encounter ? currentCriterion.encounter : null
          currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
          currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            switch (key) {
              case PROCEDURE_CODE:
                currentCriterion.code = { id: value }
                break
              case PROCEDURE_ENCOUNTER:
                currentCriterion.encounter = value
                break
              case PROCEDURE_DATE: {
                const dates = value?.split(',')
                const startOccurrence = dates ? moment(dates[0].replace(/[le|ge]/, ''), 'YYYY-MM-DD') : null
                const endOccurrence = dates ? moment(dates[1].replace(/[ge|le]/, ''), 'YYYY-MM-DD') : null

                currentCriterion.startOccurrence = startOccurrence
                currentCriterion.endOccurrence = endOccurrence
                break
              }
              default:
                break
            }
          }
        }
        break
      }
      case RESSOURCE_TYPE_CLAIM: {
        if (element.fhirFilter) {
          const filters = element.fhirFilter.split('&').map((elem) => elem.split('='))

          currentCriterion.title = 'Critère de GHM'
          currentCriterion.code = currentCriterion.code ? currentCriterion.code : null
          currentCriterion.encounter = currentCriterion.encounter ? currentCriterion.encounter : null
          currentCriterion.startOccurrence = currentCriterion.startOccurrence ? currentCriterion.startOccurrence : null
          currentCriterion.endOccurrence = currentCriterion.endOccurrence ? currentCriterion.endOccurrence : null

          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null
            switch (key) {
              case CLAIM_CODE:
                currentCriterion.code = { id: value }
                break
              case CLAIM_ENCOUNTER:
                currentCriterion.encounter = value
                break
              case CLAIM_DATE: {
                const dates = value?.split(',')
                const startOccurrence = dates ? moment(dates[0].replace(/[le|ge]/, ''), 'YYYY-MM-DD') : null
                const endOccurrence = dates ? moment(dates[1].replace(/[ge|le]/, ''), 'YYYY-MM-DD') : null

                currentCriterion.startOccurrence = startOccurrence
                currentCriterion.endOccurrence = endOccurrence
                break
              }
              default:
                break
            }
          }
        }
        break
      }
      default:
        break
    }
    return currentCriterion
  }

  const _browseJson = async (currentJson: any) => {
    if (currentJson && Array.isArray(currentJson) === true) {
      for (const currentJsonElement of currentJson) {
        if (currentJsonElement.child) {
          await _browseJson(currentJsonElement.child)
        }
        if (currentJsonElement._type !== 'InnerJoin') {
          const currentCriterion = await _retrieveInformationFromJson(currentJsonElement)
          if (currentCriterion) criteria = [...criteria, currentCriterion]
        }
      }
    } else {
      if (currentJson.child) {
        await _browseJson(currentJson.child)
      }
      if (currentJson._type !== 'InnerJoin') {
        const currentCriterion = await _retrieveInformationFromJson(currentJson)
        if (currentCriterion) criteria = [...criteria, currentCriterion]
      }
    }
  }

  const _json = json ? JSON.parse(json) : {}
  await _browseJson(_json)

  return {
    population,
    criteria
  }
}
