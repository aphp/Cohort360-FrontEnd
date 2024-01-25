import React from 'react'
import { getDataFromForm } from 'utils/formUtils'
import { pregnancyForm } from 'data/pregnancyData'
import { CohortQuestionnaireResponse } from 'types'
import FormCards from 'components/ui/FormCard'
import PregnantWoman from '@mui/icons-material/PregnantWoman'

interface PregnancyCardProps {
  form: CohortQuestionnaireResponse
}

const PregnancyCard: React.FC<PregnancyCardProps> = ({ form }) => {
  const pregnancyChipData = [
    getDataFromForm(form, pregnancyForm.pregnancyType) ?? getDataFromForm(form, pregnancyForm.twinPregnancyType),
    `Début de grossesse : ${getDataFromForm(form, pregnancyForm.pregnancyStartDate)}`,
    `Unité exécutrice : ${form.serviceProvider}`
  ]
  const pregnancyDetails = [
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

  return (
    <FormCards
      cardColor="#f194b4"
      title="Fiche de grossesse"
      chipsInfo={pregnancyChipData}
      formDetails={pregnancyDetails}
      avatar={<PregnantWoman htmlColor="#F194B4" />}
    />
  )
}

export default PregnancyCard
