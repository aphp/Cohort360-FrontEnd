import { QuestionnaireResponse, QuestionnaireResponseItemAnswer } from 'fhir/r4'
import moment from 'moment'

export const getDataFromForm = (
  form: QuestionnaireResponse,
  pregnancyDataName: { id: string; type: keyof QuestionnaireResponseItemAnswer }
) => {
  const itemValue = form.item?.find((item) => item.linkId === pregnancyDataName.id)?.answer

  switch (pregnancyDataName.type) {
    case 'valueString':
      return itemValue?.map((answer) => answer.valueString).join(' - ') ?? 'N/A'
    case 'valueDate':
      return (
        itemValue
          ?.map((answer) => {
            const date = moment(answer.valueDate)
            return date.isValid() ? date.format('DD/MM/YYYY') : ''
          })
          .filter(Boolean)
          .join(' - ') ?? 'N/A'
      )
    case 'valueDateTime':
      return (
        itemValue
          ?.map((answer) => {
            const dateTime = moment(answer.valueDateTime)
            return dateTime.isValid() ? dateTime.format('DD/MM/YYYY à HH:mm') : ''
          })
          .filter(Boolean)
          .join(' - ') ?? 'N/A'
      )
    case 'valueCoding':
      return itemValue?.map((answer) => answer.valueCoding?.display).join(' - ') ?? 'N/A'
    case 'valueInteger':
      return itemValue?.map((answer) => answer.valueInteger).join(' - ') ?? 'N/A'
    case 'valueDecimal':
      return itemValue?.map((answer) => answer.valueDecimal).join(' - ') ?? 'N/A'
    case 'valueBoolean':
      return itemValue ? itemValue?.map((answer) => (answer.valueBoolean ? 'Oui' : 'Non')).join(' - ') : 'N/A'
    default:
      return 'N/A'
  }
}
