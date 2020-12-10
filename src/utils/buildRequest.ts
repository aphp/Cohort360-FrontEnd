import moment from 'moment'

export default (selectedCriteria: any) => {
  type RequeteurSearchType = { _type: string; resourceType: string; fhirFilter: string }
  let newJson: RequeteurSearchType[] = []

  for (const selectedCriterion of selectedCriteria) {
    let fhirFilter = ''

    const filterReducer = (accumulator: any, currentValue: any) =>
      accumulator ? `${accumulator}&${currentValue}` : currentValue
    // Preparation du multi requete, par ex: gender = m + f + other
    const searchReducer = (accumulator: any, currentValue: any) =>
      accumulator ? `${accumulator},${currentValue}` : currentValue

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
