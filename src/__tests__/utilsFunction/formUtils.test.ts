import {
  formatHospitalisationDates,
  generateHospitDetails,
  getBirthDeliveryDate,
  getDataFromForm,
  getFormDetails,
  getFormLabel,
  getFormName
} from 'utils/formUtils'
import { Questionnaire, QuestionnaireResponseItemAnswer } from 'fhir/r4'
import { CohortQuestionnaireResponse } from 'types'
import { FormNames } from 'types/searchCriterias'
import labels from 'labels.json'
import { hospitForm } from 'data/hospitData'
import { endDate, form, questionnaireList, startDate } from '__tests__/data/explorationData/questionnaires'

describe('test of getFormName function', () => {
  it('should return form name unknown if no questionnaire id match', () => {
    const _form = { ...form, questionnaire: 'Questionnaire/6' }
    expect(getFormName(_form, questionnaireList)).toBe(FormNames.UNKNOWN)
  })
  it('should return matching id if part of FormNames', () => {
    const _form = { ...form, questionnaire: 'Questionnaire/1' }
    expect(getFormName(_form, questionnaireList)).toBe(FormNames.PREGNANCY)
  })
  it('should return unknown if it isnt found in FormNames', () => {
    const _form = { ...form, questionnaire: 'Questionnaire/2' }
    expect(getFormName(_form, questionnaireList)).toBe(FormNames.UNKNOWN)
  })
  it('should return undefined if form has no questionnaire id', () => {
    expect(getFormName(form, questionnaireList)).toBe(FormNames.UNKNOWN)
  })
  it('should return undefined if questionnairesList is empty', () => {
    const questionnaireList: Questionnaire[] = []
    expect(getFormName(form, questionnaireList)).toBe(FormNames.UNKNOWN)
  })
  it('should return undefined if no matching name', () => {
    const questionnaireList: Questionnaire[] = [
      {
        id: '1',
        resourceType: 'Questionnaire',
        status: 'active'
      }
    ]
    expect(getFormName(form, questionnaireList)).toBe(FormNames.UNKNOWN)
  })
})

describe('test of getFormLabel function', () => {
  it('should return "Fiche de grossesse" if formName is FormNames.Pregnancy', () => {
    const formName = FormNames.PREGNANCY
    expect(getFormLabel(formName)).toBe(labels.formNames.pregnancy)
  })
  it('should return "Inconnu" if formName is empty', () => {
    const formName = undefined
    expect(getFormLabel(formName)).toBe('Inconnu')
  })
})

describe('test of getFormDetails', () => {
  it('should return hospit details if FormNames = FormNames.HOSPIT', () => {
    const formName = FormNames.HOSPIT
    expect(getFormDetails(form, formName)).toStrictEqual(generateHospitDetails(form))
  })
  it('should return empty string if formName is unknown', () => {
    const formName = FormNames.UNKNOWN
    expect(getFormDetails(form, formName)).toStrictEqual([])
  })
})

describe('test of getBirthDeliveryDate', () => {
  it('should return the birth delivery date when the item is found', () => {
    const _form = {
      ...form,
      item: [
        {
          linkId: 'F_MATER_004961',
          answer: [
            {
              valueDateTime: '2023-03-12T07:44:00+00:00'
            }
          ]
        }
      ]
    }

    const log = getBirthDeliveryDate(_form, hospitForm)
    console.log('salut le monde' , log)

    expect(getBirthDeliveryDate(_form, hospitForm)).toBe('Accouchement le 12/03/2023 à 08:44')
  })
  it('should return undefined if form item is empty', () => {
    expect(getBirthDeliveryDate(form, hospitForm)).toBeUndefined()
  })
  it('should return undefined if the item is not found', () => {
    const _form = {
      ...form,
      item: [
        {
          linkId: 'fakeLinkId'
        }
      ]
    }

    expect(getBirthDeliveryDate(_form, hospitForm)).toBeUndefined()
  })
})

describe('test of formatHospitalisationDates', () => {
  it('should be undefined if no start date', () => {
    const startDate = undefined

    expect(formatHospitalisationDates(startDate, endDate)).toBeUndefined()
  })
  it('should return undefined if wrong date format', () => {
    const startDate = 'wrongdateformat'

    expect(formatHospitalisationDates(startDate)).toBeUndefined()
  })
  it('should return right date format if start date and end date are present', () => {
    expect(formatHospitalisationDates(startDate, endDate)).toBe('Hospitalisation du 01/03/2023 au 12/03/2023')
  })
  it('should return right date format if only start date is present', () => {
    expect(formatHospitalisationDates(startDate)).toBe("Début d'hospitalisation le 01/03/2023")
  })
})

describe('test of getDataFromForm', () => {
  it('should return N/A if form has no item', () => {
    const pregnancyDataName = { id: 'string', type: 'valueBoolean' as keyof QuestionnaireResponseItemAnswer }

    expect(getDataFromForm(form, pregnancyDataName)).toBe('N/A')
  })
  it('should return N/A if no answer found', () => {
    const _form = {
      ...form,
      item: [
        {
          linkId: 'fakeLinkId'
        }
      ]
    }
    const pregnancyDataName = { id: 'fakeLinkId', type: 'valueBoolean' as keyof QuestionnaireResponseItemAnswer }

    expect(getDataFromForm(_form, pregnancyDataName)).toBe('N/A')
  })
  it('should return N/A if pregnancyDataName has unknown type found', () => {
    const _form = {
      ...form,
      item: [
        {
          linkId: 'fakeLinkId'
        }
      ]
    }
    const pregnancyDataName = { id: 'fakeLinkId', type: 'faux !' as keyof QuestionnaireResponseItemAnswer }

    expect(getDataFromForm(_form, pregnancyDataName)).toBe('N/A')
  })
  it('should return oui/non if boolean value', () => {
    const _form: CohortQuestionnaireResponse = {
      ...form,
      item: [
        {
          linkId: 'fakeLinkId',
          answer: [
            {
              valueBoolean: true
            }
          ]
        }
      ]
    }
    const pregnancyDataName = { id: 'fakeLinkId', type: 'valueBoolean' as keyof QuestionnaireResponseItemAnswer }

    expect(getDataFromForm(_form, pregnancyDataName)).toBe('Oui')
  })
})
