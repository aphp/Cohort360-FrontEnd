import { QuestionnaireResponse, QuestionnaireResponseItemAnswer } from 'fhir/r4'

export const getDataFromForm = (
  form: QuestionnaireResponse,
  pregnancyDataName: { id: string; type: keyof QuestionnaireResponseItemAnswer }
) => {
  const itemValue = form.item?.find((item) => item.linkId === pregnancyDataName.id)?.answer

  switch (pregnancyDataName.type) {
    case 'valueString':
      return itemValue?.[0]?.valueString ?? 'N/A'
    case 'valueDate':
      return itemValue?.[0]?.valueDate ?? 'N/A'
    case 'valueCoding':
      return itemValue?.map((answer) => answer.valueCoding?.display).join(' - ') ?? 'N/A'
    case 'valueInteger':
      return itemValue?.[0]?.valueInteger ?? 'N/A'
    default:
      return 'N/A'
  }
}
