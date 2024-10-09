import React from 'react'
import { formatHospitalisationDates, generateHospitDetails, getBirthDeliveryDate } from 'utils/formUtils'
import { CohortQuestionnaireResponse } from 'types'
import { hospitForm } from 'data/hospitData'
import FormCards from 'components/ui/FormCard'
import DomainAdd from '@mui/icons-material/DomainAdd'
import labels from 'labels.json'
interface HospitCardProps {
  form: CohortQuestionnaireResponse
}

const HospitCard: React.FC<HospitCardProps> = ({ form }) => {
  const hospitChipData = [
    getBirthDeliveryDate(form, hospitForm),
    formatHospitalisationDates(form.hospitDates?.start, form.hospitDates?.end),
    `Unité exécutrice : ${form.serviceProvider}`
  ].filter((item): item is string => item !== undefined)

  const hospitDetails = generateHospitDetails(form)

  return (
    <FormCards
      cardColor="#A8D178"
      title={labels.formNames.hospit}
      chipsInfo={hospitChipData}
      formDetails={hospitDetails}
      avatar={<DomainAdd htmlColor="#A8D178" />}
    />
  )
}

export default HospitCard
