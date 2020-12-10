import moment from 'moment'

import { fetchPerimeterInfoForRequeteur as fetchPopulation } from '../services/perimeters'
import { ScopeTreeRow, SelectedCriteriaType } from 'types'

type RequeteurSearchType = {
  _type: string
  resourceType: 'Patient' | 'Encounter' | 'Claim' | 'Procedure' | 'Condition' | 'Composition'
  fhirFilter: string
}

export function buildRequest(selectedPopulation: any, selectedCriteria: any) {
  if (!selectedPopulation) return ''

  const filterReducer = (accumulator: any, currentValue: any) =>
    accumulator ? `${accumulator}&${currentValue}` : currentValue
  // Preparation du multi requete, par ex: gender = m + f + other
  const searchReducer = (accumulator: any, currentValue: any) =>
    accumulator ? `${accumulator},${currentValue}` : currentValue

  let newJson: RequeteurSearchType[] = [
    {
      _type: 'resource',
      resourceType: 'Patient',
      fhirFilter: `_list=${selectedPopulation
        .map((selectedPopulation: any) => selectedPopulation.id)
        .reduce(searchReducer)}`
    }
  ]

  for (const selectedCriterion of selectedCriteria) {
    let fhirFilter = ''

    switch (selectedCriterion.type) {
      case 'Patient': {
        let ageFilter = ''
        if (selectedCriterion.years && selectedCriterion.years !== [0, 100]) {
          const date1 = moment().subtract(selectedCriterion.years[1], 'years').format('YYYY-MM-DD')
          const date2 = moment().subtract(selectedCriterion.years[0], 'years').format('YYYY-MM-DD')
          ageFilter = `birthdate=ge${date1},le${date2}`
        }

        fhirFilter = [
          `${selectedCriterion.gender ? `gender=${selectedCriterion.gender.id}` : ''}`,
          `${selectedCriterion.vitalStatus ? `deceased=${selectedCriterion.vitalStatus.id}` : ''}`,
          `${ageFilter ? `${ageFilter}` : ''}`
        ].reduce(filterReducer)
        break
      }

      case 'Encounter': {
        let lengthFilter = ''
        if (selectedCriterion.duration && selectedCriterion.duration !== [0, 100]) {
          lengthFilter = `length=ge${selectedCriterion.duration[0]},le${selectedCriterion.duration[1]}`
        }

        fhirFilter = [
          `${selectedCriterion.admissionMode ? `admissionMode=${selectedCriterion.admissionMode.id}` : ''}`,
          `${selectedCriterion.entryMode ? `entryMode=${selectedCriterion.entryMode.id}` : ''}`,
          `${selectedCriterion.exitMode ? `exitMode=${selectedCriterion.exitMode.id}` : ''}`,
          `${selectedCriterion.fileStatus ? `fileStatus=${selectedCriterion.fileStatus.id}` : ''}`,
          `${lengthFilter ? `${lengthFilter}` : ''}`
        ].reduce(filterReducer)
        break
      }

      case 'Composition': {
        fhirFilter = [
          `${selectedCriterion.search ? `text=${selectedCriterion.search}` : ''}`,
          `${selectedCriterion.docType ? `type=${selectedCriterion.docType.id}` : ''}`
        ].reduce(filterReducer)
        break
      }

      case 'Condition': {
        fhirFilter = [
          `${selectedCriterion.code ? `code=${selectedCriterion.code.id}` : ''}`,
          `${selectedCriterion.diagnosticType ? `type=${selectedCriterion.diagnosticType.id}` : ''}`
        ].reduce(filterReducer)
        break
      }

      case 'Procedure': {
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
          `${selectedCriterion.code ? `code=${selectedCriterion.code.id}` : ''}`,
          `${dateFilter ? `date=${dateFilter}` : ''}`
        ].reduce(filterReducer)
        break
      }

      case 'Claim': {
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
          `${selectedCriterion.code ? `code=${selectedCriterion.code.id}` : ''}`,
          `${dateFilter ? `created=${dateFilter}` : ''}`
        ].reduce(filterReducer)
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
    const currentCriterion = {
      type: element.resourceType,
      title: '',
      fhirFilter: ''
    }
    switch (element.resourceType) {
      case 'Patient': {
        if (element.fhirFilter) {
          const filters = element.fhirFilter.split('&').map((elem) => elem.split('='))
          for (const filter of filters) {
            const key = filter ? filter[0] : null
            const value = filter ? filter[1] : null

            if (key === '_list') {
              population = await fetchPopulation(value ?? '')
              return
            } else {
            }
          }
        }
        break
      }
      case 'Encounter': {
        break
      }
      case 'Condition': {
        break
      }
      case 'Procedure': {
        break
      }
      case 'Claim': {
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
