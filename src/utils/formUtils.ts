import { hospitForm } from 'data/hospitData'
import { pregnancyForm } from 'data/pregnancyData'
import { Questionnaire, QuestionnaireResponse, QuestionnaireResponseItemAnswer } from 'fhir/r4'
import moment from 'moment'
import { CohortQuestionnaireResponse } from 'types'
import { FormNames } from 'types/searchCriterias'
import labels from 'labels.json'

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

export const getFormDetails = (form: CohortQuestionnaireResponse, formName: FormNames) => {
  const mapToFormDetails = {
    [FormNames.HOSPIT]: generateHospitDetails(form),
    [FormNames.PREGNANCY]: generatePregnancyDetails(form),
    [FormNames.UNKNOWN]: []
  }

  return mapToFormDetails[formName]
}

export const getBirthDeliveryDate = (
  form: QuestionnaireResponse,
  hospitForm: {
    [key: string]: {
      id: string
      type: keyof QuestionnaireResponseItemAnswer
    }
  }
) => {
  const item = form.item?.find((item) => item.linkId === hospitForm.birthDeliveryStartDate.id)
  return item ? `Accouchement le ${getDataFromForm(form, hospitForm.birthDeliveryStartDate)}` : undefined
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

export const generateHospitDetails = (form: CohortQuestionnaireResponse) => {
  return [
    {
      name: "Motif d'hospitalisation",
      value: getDataFromForm(form, hospitForm.hospitReason)
    },
    {
      name: 'Transfert in utero',
      value: getDataFromForm(form, hospitForm.inUteroTransfer)
    },
    {
      name: 'Corticothérapie pour maturation foetale faite',
      value: getDataFromForm(form, hospitForm.maturationCorticotherapie)
    },
    {
      name: 'Date geste ou chirurgie',
      value: getDataFromForm(form, hospitForm.chirurgicalGestureDate)
    },
    { name: 'Type de geste ou chirurgie', value: getDataFromForm(form, hospitForm.chirurgicalGesture) },
    {
      name: 'Accouchement',
      value: getDataFromForm(form, hospitForm.childbirth)
    },
    {
      name: "Accouchement à l'hôpital",
      value: getDataFromForm(form, hospitForm.hospitalChildBirthPlace)
    },
    {
      name: 'Accouchement à domicile',
      value: getDataFromForm(form, hospitForm.homeChildBirthPlace)
    },
    {
      name: "Lieu d'accouchement autre",
      value: getDataFromForm(form, hospitForm.otherHospitalChildBirthPlace)
    },
    {
      name: 'Mode de mise en travail',
      value: getDataFromForm(form, hospitForm.childbirthMode)
    },
    {
      name: 'Motif de maturation / déclenchement',
      value: getDataFromForm(form, hospitForm.maturationReason)
    },
    {
      name: 'Modalités de maturation cervicale initiale',
      value: getDataFromForm(form, hospitForm.maturationModality)
    },
    {
      name: 'Présentation du foetus - liste',
      value: getDataFromForm(form, hospitForm.foetusPresentation)
    },
    {
      name: "Présentation à l'entrée en travail ou en début de césarienne",
      value: getDataFromForm(form, hospitForm.laborOrCesareanEntry)
    },
    {
      name: 'Analgésie / anesthésie - type',
      value: getDataFromForm(form, hospitForm.analgesieType)
    },
    {
      name: 'Accouchement - Date/heure',
      value: getDataFromForm(form, hospitForm.birthDeliveryStartDate)
    },
    {
      name: 'Accouchement - Terme - Semaines',
      value: getDataFromForm(form, hospitForm.birthDeliveryWeeks)
    },
    {
      name: 'Accouchement - Terme - Jours',
      value: getDataFromForm(form, hospitForm.birthDeliveryDays)
    },
    {
      name: "Voie d'accouchement",
      value: getDataFromForm(form, hospitForm.birthDeliveryWay)
    },
    {
      name: 'Modalités de la césarienne',
      value: getDataFromForm(form, hospitForm.cSectionModality)
    },
    {
      name: 'Identité - Sexe',
      value: getDataFromForm(form, hospitForm.gender)
    },
    {
      name: 'Mensurations naissance - Poids (g)',
      value: getDataFromForm(form, hospitForm.birthMensurationsGrams)
    },
    {
      name: 'Mensurations naissance - Poids percentile',
      value: getDataFromForm(form, hospitForm.birthMensurationsPercentil)
    },
    {
      name: 'Statut vital à la naissance',
      value: getDataFromForm(form, hospitForm.birthStatus)
    },
    {
      name: 'Hémorragie du post-partum',
      value: getDataFromForm(form, hospitForm.postpartumHemorrhage)
    },
    {
      name: 'Périnée - État',
      value: getDataFromForm(form, hospitForm.conditionPerineum)
    },
    {
      name: 'Pertes sanguines estimées totales (mL)',
      value: getDataFromForm(form, hospitForm.bloodLossEstimation)
    },
    {
      name: 'Lieu de sortie - Type',
      value: getDataFromForm(form, hospitForm.exitPlaceType)
    },
    {
      name: "Type d'allaitement",
      value: getDataFromForm(form, hospitForm.feedingType)
    }
  ]
}

export const generatePregnancyDetails = (form: CohortQuestionnaireResponse) => {
  return [
    {
      name: 'Date de début de grossesse',
      value: getDataFromForm(form, pregnancyForm.pregnancyStartDate)
    },
    {
      name: 'Nombre de foetus',
      value: getDataFromForm(form, pregnancyForm.foetus)
    },
    { name: 'Type de grossesse', value: getDataFromForm(form, pregnancyForm.pregnancyType) },
    {
      name: 'Type de grossesse gémellaire',
      value: getDataFromForm(form, pregnancyForm.twinPregnancyType)
    },
    { name: 'Parité', value: getDataFromForm(form, pregnancyForm.parity) },
    {
      name: 'Suivi échographique - Précision',
      value: getDataFromForm(form, pregnancyForm.ultrasoundMonitoring)
    },
    {
      name: 'Corticothérapie pour maturation pulmonaire foetale',
      value: getDataFromForm(form, pregnancyForm.corticotherapie)
    },
    {
      name: 'Raisons du suivi au diagnostic prénatal',
      value: getDataFromForm(form, pregnancyForm.reasonsOfPrenatalDiagnosticMonitoring)
    }
  ]
}
