import { Questionnaire } from 'fhir/r4'
import { CohortQuestionnaireResponse } from 'types'
import { FormNames } from 'types/searchCriterias'

export const form: CohortQuestionnaireResponse = {
  status: 'completed',
  id: '1',
  resourceType: 'QuestionnaireResponse'
}

export const questionnaireList: Questionnaire[] = [
  {
    id: '1',
    name: FormNames.PREGNANCY,
    resourceType: 'Questionnaire',
    status: 'active'
  },
  {
    id: '2',
    name: 'salut',
    resourceType: 'Questionnaire',
    status: 'active'
  }
]

export const startDate = '2023-03-01T07:44:00+00:00'
export const endDate = '2023-03-12T07:44:00+00:00'
