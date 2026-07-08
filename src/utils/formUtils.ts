import { Questionnaire, QuestionnaireResponse, QuestionnaireResponseItemAnswer } from 'fhir/r4'
import moment from 'moment'
import { CohortQuestionnaireResponse } from 'types'
import { FormNames } from 'types/searchCriterias'
import labels from 'labels.json'
import { FormItem } from 'utils/questionnaireFormData'
import { HOSPIT_LINK_IDS, PREGNANCY_LINK_IDS } from 'constants/maternityLinkIds'

export type FormItemsByLinkId = Record<string, FormItem>

export const buildFormItemsByLinkId = (formItems: FormItem[]): FormItemsByLinkId =>
  formItems.reduce<FormItemsByLinkId>((acc, item) => {
    acc[item.linkId] = item
    return acc
  }, {})

type DisplayField = { linkId: string; name: string }

const HOSPIT_DISPLAY_FIELDS: DisplayField[] = [
  { linkId: HOSPIT_LINK_IDS.hospitReason, name: "Motif d'hospitalisation" },
  { linkId: HOSPIT_LINK_IDS.inUteroTransfer, name: 'Transfert in utero' },
  { linkId: HOSPIT_LINK_IDS.maturationCorticotherapie, name: 'Corticothérapie pour maturation foetale faite' },
  { linkId: HOSPIT_LINK_IDS.chirurgicalGestureDate, name: 'Date geste ou chirurgie' },
  { linkId: HOSPIT_LINK_IDS.chirurgicalGesture, name: 'Type de geste ou chirurgie' },
  { linkId: HOSPIT_LINK_IDS.childbirth, name: 'Accouchement' },
  { linkId: HOSPIT_LINK_IDS.hospitalChildBirthPlace, name: "Accouchement à l'hôpital" },
  { linkId: HOSPIT_LINK_IDS.homeChildBirthPlace, name: 'Accouchement à domicile' },
  { linkId: HOSPIT_LINK_IDS.otherHospitalChildBirthPlace, name: "Lieu d'accouchement autre" },
  { linkId: HOSPIT_LINK_IDS.childbirthMode, name: 'Mode de mise en travail' },
  { linkId: HOSPIT_LINK_IDS.maturationReason, name: 'Motif de maturation / déclenchement' },
  { linkId: HOSPIT_LINK_IDS.maturationModality, name: 'Modalités de maturation cervicale initiale' },
  { linkId: HOSPIT_LINK_IDS.foetusPresentation, name: 'Présentation du foetus - liste' },
  {
    linkId: HOSPIT_LINK_IDS.laborOrCesareanEntry,
    name: "Présentation à l'entrée en travail ou en début de césarienne"
  },
  { linkId: HOSPIT_LINK_IDS.analgesieType, name: 'Analgésie / anesthésie - type' },
  { linkId: HOSPIT_LINK_IDS.birthDeliveryStartDate, name: 'Accouchement - Date/heure' },
  { linkId: HOSPIT_LINK_IDS.birthDeliveryWeeks, name: 'Accouchement - Terme - Semaines' },
  { linkId: HOSPIT_LINK_IDS.birthDeliveryDays, name: 'Accouchement - Terme - Jours' },
  { linkId: HOSPIT_LINK_IDS.birthDeliveryWay, name: "Voie d'accouchement" },
  { linkId: HOSPIT_LINK_IDS.cSectionModality, name: 'Modalités de la césarienne' },
  { linkId: HOSPIT_LINK_IDS.gender, name: 'Identité - Sexe' },
  { linkId: HOSPIT_LINK_IDS.birthMensurationsGrams, name: 'Mensurations naissance - Poids (g)' },
  { linkId: HOSPIT_LINK_IDS.birthMensurationsPercentil, name: 'Mensurations naissance - Poids percentile' },
  { linkId: HOSPIT_LINK_IDS.birthStatus, name: 'Statut vital à la naissance' },
  { linkId: HOSPIT_LINK_IDS.postpartumHemorrhage, name: 'Hémorragie du post-partum' },
  { linkId: HOSPIT_LINK_IDS.conditionPerineum, name: 'Périnée - État' },
  { linkId: HOSPIT_LINK_IDS.bloodLossEstimation, name: 'Pertes sanguines estimées totales (mL)' },
  { linkId: HOSPIT_LINK_IDS.exitPlaceType, name: 'Lieu de sortie - Type' },
  { linkId: HOSPIT_LINK_IDS.feedingType, name: "Type d'allaitement" }
]

const PREGNANCY_DISPLAY_FIELDS: DisplayField[] = [
  { linkId: PREGNANCY_LINK_IDS.pregnancyStartDate, name: 'Date de début de grossesse' },
  { linkId: PREGNANCY_LINK_IDS.foetus, name: 'Nombre de foetus' },
  { linkId: PREGNANCY_LINK_IDS.pregnancyType, name: 'Type de grossesse' },
  { linkId: PREGNANCY_LINK_IDS.twinPregnancyType, name: 'Type de grossesse gémellaire' },
  { linkId: PREGNANCY_LINK_IDS.parity, name: 'Parité' },
  { linkId: PREGNANCY_LINK_IDS.ultrasoundMonitoring, name: 'Suivi échographique - Précision' },
  { linkId: PREGNANCY_LINK_IDS.corticotherapie, name: 'Corticothérapie pour maturation pulmonaire foetale' },
  {
    linkId: PREGNANCY_LINK_IDS.reasonsOfPrenatalDiagnosticMonitoring,
    name: 'Raisons du suivi au diagnostic prénatal'
  }
]

type FieldDescriptor = { id: string; type: keyof QuestionnaireResponseItemAnswer } | FormItem

const resolveLinkIdAndType = (
  descriptor: FieldDescriptor
): { linkId: string; type: keyof QuestionnaireResponseItemAnswer } => {
  if ('linkId' in descriptor) {
    return { linkId: descriptor.linkId, type: descriptor.itemType }
  }
  return { linkId: descriptor.id, type: descriptor.type }
}

export const getDataFromForm = (form: QuestionnaireResponse, descriptor: FieldDescriptor) => {
  const { linkId, type } = resolveLinkIdAndType(descriptor)
  const itemValue = form.item?.find((item) => item.linkId === linkId)?.answer

  switch (type) {
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
            const dateTime = moment.parseZone(answer.valueDateTime)
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

export const getFormName = (form: CohortQuestionnaireResponse, questionnairesList: Questionnaire[]) => {
  const formQuestionnaireId = form.questionnaire?.replace('Questionnaire/', '')
  const formName = questionnairesList.find((questionnaire) => questionnaire.id === formQuestionnaireId)?.name
  return formName && Object.values(FormNames).includes(formName as FormNames) ? formName : FormNames.UNKNOWN
}

export const getFormLabel = (formName: FormNames = FormNames.UNKNOWN) => {
  if (formName) {
    const mapToFormLabels = {
      [FormNames.HOSPIT]: labels.formNames.hospit,
      [FormNames.PREGNANCY]: labels.formNames.pregnancy,
      [FormNames.UNKNOWN]: 'Inconnu'
    }

    return mapToFormLabels[formName]
  }
}

const generateDetails = (
  form: CohortQuestionnaireResponse,
  fields: DisplayField[],
  formItemsByLinkId: FormItemsByLinkId
) =>
  fields
    .map((field) => {
      const formItem = formItemsByLinkId[field.linkId]
      if (!formItem) {
        return undefined
      }
      return { name: field.name, value: getDataFromForm(form, formItem) }
    })
    .filter((detail): detail is { name: string; value: string } => detail !== undefined)

export const getFormDetails = (
  form: CohortQuestionnaireResponse,
  formName: FormNames,
  formItemsByLinkId: FormItemsByLinkId
) => {
  const mapToFormDetails = {
    [FormNames.HOSPIT]: () => generateHospitDetails(form, formItemsByLinkId),
    [FormNames.PREGNANCY]: () => generatePregnancyDetails(form, formItemsByLinkId),
    [FormNames.UNKNOWN]: () => []
  }

  return mapToFormDetails[formName]()
}

export const getBirthDeliveryDate = (form: QuestionnaireResponse, formItemsByLinkId: FormItemsByLinkId) => {
  const formItem = formItemsByLinkId[HOSPIT_LINK_IDS.birthDeliveryStartDate]
  if (!formItem) {
    return undefined
  }
  const item = form.item?.find((item) => item.linkId === formItem.linkId)
  return item ? `Accouchement le ${getDataFromForm(form, formItem)}` : undefined
}

export const formatHospitalisationDates = (start?: string, end?: string) => {
  const _start = start && moment(start).isValid() ? moment(start).format('DD/MM/YYYY') : undefined
  const _end = end && moment(end).isValid() ? moment(end).format('DD/MM/YYYY') : undefined
  if (_start && _end) {
    return `Hospitalisation du ${_start} au ${_end}`
  } else if (_start && !_end) {
    return `Début d'hospitalisation le ${_start}`
  }
}

export const generateHospitDetails = (form: CohortQuestionnaireResponse, formItemsByLinkId: FormItemsByLinkId) =>
  generateDetails(form, HOSPIT_DISPLAY_FIELDS, formItemsByLinkId)

export const generatePregnancyDetails = (form: CohortQuestionnaireResponse, formItemsByLinkId: FormItemsByLinkId) =>
  generateDetails(form, PREGNANCY_DISPLAY_FIELDS, formItemsByLinkId)
