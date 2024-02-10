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
      name: 'Risques liés aux antécédents maternels',
      value: getDataFromForm(pregnancyFormData, pregnancyForm.maternalRisks)
    },
    {
      name: 'Suivi échographique - Précision',
      value: getDataFromForm(pregnancyFormData, pregnancyForm.ultrasoundMonitoring)
    },
    {
      name: 'Risques ou complications de la grossesse',
      value: getDataFromForm(pregnancyFormData, pregnancyForm.risksOrComplicationsOfPregnancy)
    },
    {
      name: 'Grossesse suivie au diagnostic prénatal',
      value: getDataFromForm(pregnancyFormData, pregnancyForm.reasonsOfPrenatalDiagnosticMonitoring)
    }
  ]

  return <FormDetailsDialog title="Détails du formulaire de grossesse" content={pregnancyDetails} onClose={onClose} />
}

export default PregnancyFormDetails
