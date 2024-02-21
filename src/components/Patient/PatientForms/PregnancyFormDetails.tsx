import React from 'react'
import FormDetailsDialog from 'components/ui/FormDetailsDialog'
import { pregnancyForm } from 'data/pregnancyData'
import { getDataFromForm } from 'utils/formUtils'
import { QuestionnaireResponse } from 'fhir/r4'

type PregnancyFormDetailsProps = {
  pregnancyFormData: QuestionnaireResponse
  onClose: () => void
}

const PregnancyFormDetails = ({ pregnancyFormData, onClose }: PregnancyFormDetailsProps) => {
  const pregnancyDetails = [
    {
      name: 'Date de début de grossesse',
      value: getDataFromForm(pregnancyFormData, pregnancyForm.pregnancyStartDate)
    },
    {
      name: 'Nombre de foetus',
      value: getDataFromForm(pregnancyFormData, pregnancyForm.foetus)
    },
    { name: 'Type de grossesse', value: getDataFromForm(pregnancyFormData, pregnancyForm.pregnancyType) },
    {
      name: 'Type de grossesse gémellaire',
      value: getDataFromForm(pregnancyFormData, pregnancyForm.twinPregnancyType)
    },
    { name: 'Parité', value: getDataFromForm(pregnancyFormData, pregnancyForm.parity) },
    {
      name: 'Suivi échographique - Précision',
      value: getDataFromForm(pregnancyFormData, pregnancyForm.ultrasoundMonitoring)
    },
    {
      name: 'Corticothérapie pour maturation pulmonaire foetale',
      value: getDataFromForm(pregnancyFormData, pregnancyForm.corticotherapie)
    },
    {
      name: 'Raisons du suivi au diagnostic prénatal',
      value: getDataFromForm(pregnancyFormData, pregnancyForm.reasonsOfPrenatalDiagnosticMonitoring)
    }
  ]

  return <FormDetailsDialog title="Détails du formulaire de grossesse" content={pregnancyDetails} onClose={onClose} />
}

export default PregnancyFormDetails
