import React from 'react'
import { generatePregnancyDetails, getDataFromForm } from 'utils/formUtils'
import { pregnancyForm } from 'data/pregnancyData'
import { CohortQuestionnaireResponse } from 'types'
import FormCards from 'components/ui/FormCard'
import PregnantWoman from '@mui/icons-material/PregnantWoman'
import labels from 'labels.json'

interface PregnancyCardProps {
  form: CohortQuestionnaireResponse
}

const PregnancyCard: React.FC<PregnancyCardProps> = ({ form }) => {
  const pregnancyChipData = [
    getDataFromForm(form, pregnancyForm.pregnancyType) ?? getDataFromForm(form, pregnancyForm.twinPregnancyType),
    `Début de grossesse : ${getDataFromForm(form, pregnancyForm.pregnancyStartDate)}`,
    `Unité exécutrice : ${form.serviceProvider}`
  ]
  const pregnancyDetails = generatePregnancyDetails(form)

  return (
    <FormCards
      cardColor="#f194b4"
      title={labels.formNames.pregnancy}
      chipsInfo={pregnancyChipData}
      formDetails={pregnancyDetails}
      avatar={<PregnantWoman htmlColor="#F194B4" />}
    />
  )
}

export default PregnancyCard
