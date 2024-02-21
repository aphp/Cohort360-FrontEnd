import React from 'react'
import FormDetailsDialog from 'components/ui/FormDetailsDialog'
import { QuestionnaireResponse } from 'fhir/r4'
import { getDataFromForm } from 'utils/formUtils'
import { hospitForm } from 'data/hospitData'

type HospitFormDetailsProps = {
  hospitFormData: QuestionnaireResponse
  onClose: () => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HospitFormDetails = ({ hospitFormData, onClose }: HospitFormDetailsProps) => {
  const hospitDetails = [
    {
      name: "Motif d'hospitalisation",
      value: getDataFromForm(hospitFormData, hospitForm.hospitReason)
    },
    {
      name: 'Transfert in utero',
      value: getDataFromForm(hospitFormData, hospitForm.hospitInUteroTransfer)
    },
    {
      name: 'Corticothérapie pour maturation foetale faite',
      value: getDataFromForm(hospitFormData, hospitForm.hospitMaturationCorticotherapie)
    },
    {
      name: 'Date geste ou chirurgie',
      value: getDataFromForm(hospitFormData, hospitForm.hospitChirurgicalGestureDate)
    },
    {
      name: 'Âge gestationnel lors de la chirurgie ou du geste',
      value: getDataFromForm(hospitFormData, hospitForm.hospitChirurgicalAge)
    },
    { name: 'Type de geste ou chirurgie', value: getDataFromForm(hospitFormData, hospitForm.hospitChirurgicalType) },
    {
      name: 'Accouchement',
      value: getDataFromForm(hospitFormData, hospitForm.hospitChildbirth)
    },
    {
      name: "Lieu d'accouchement - domicile",
      value: getDataFromForm(hospitFormData, hospitForm.hospitChildbirthPlace)
    },
    {
      name: 'Mode de mise en travail',
      value: getDataFromForm(hospitFormData, hospitForm.hospitLaborMode)
    },
    {
      name: 'Motif de maturation / déclenchement',
      value: getDataFromForm(hospitFormData, hospitForm.hospitMaturationReason)
    },
    {
      name: 'Modalités de maturation cervicale initiale',
      value: getDataFromForm(hospitFormData, hospitForm.hospitMaturationModality)
    },
    {
      name: 'Présentation du foetus - liste',
      value: getDataFromForm(hospitFormData, hospitForm.hospitFoetusPresentation)
    },
    {
      name: "Présentation à l'entrée en travail ou en début de césarienne",
      value: getDataFromForm(hospitFormData, hospitForm.hospitLaborOrCesareanPresentation)
    },
    {
      name: 'Analgésie / anesthésie - type',
      value: getDataFromForm(hospitFormData, hospitForm.hospitAnalgesiaAnesthesiaType)
    },
    {
      name: 'Accouchement - Date/heure',
      value: getDataFromForm(hospitFormData, hospitForm.hospitChildbirthDate)
    },
    {
      name: 'Accouchement - Terme - Semaines',
      value: getDataFromForm(hospitFormData, hospitForm.hospitChildbirthWeeks)
    },
    {
      name: 'Accouchement - Terme - Jours',
      value: getDataFromForm(hospitFormData, hospitForm.hospitChildbirthDays)
    },
    {
      name: "Voie d'accouchement",
      value: getDataFromForm(hospitFormData, hospitForm.hospitLaborWay)
    },
    {
      name: 'Modalités de la césarienne',
      value: getDataFromForm(hospitFormData, hospitForm.hospitCesareanModality)
    },
    {
      name: 'Identité - Sexe',
      value: getDataFromForm(hospitFormData, hospitForm.hospitIdentityGender)
    },
    {
      name: 'Mensurations naissance - Poids (g)',
      value: getDataFromForm(hospitFormData, hospitForm.hospitBirthWeightGrams)
    },
    {
      name: 'Mensurations naissance - Poids percentile',
      value: getDataFromForm(hospitFormData, hospitForm.hospitBirthWeightPercentile)
    },
    {
      name: 'Né vivant',
      value: getDataFromForm(hospitFormData, hospitForm.hospitBornAlive)
    },
    {
      name: 'Hémorragie du post-partum',
      value: getDataFromForm(hospitFormData, hospitForm.hospitPostPartumBleeding)
    },
    {
      name: 'Périnée - État',
      value: getDataFromForm(hospitFormData, hospitForm.hospitPerineumState)
    },
    {
      name: 'Pertes sanguines estimées totales (mL)',
      value: getDataFromForm(hospitFormData, hospitForm.hospitBloodLossEstimation)
    },
    {
      name: 'Lieu de sortie - Type',
      value: getDataFromForm(hospitFormData, hospitForm.hospitExitMode)
    },
    {
      name: "Type d'allaitement",
      value: getDataFromForm(hospitFormData, hospitForm.hospitFeedingType)
    }
  ]

  return <FormDetailsDialog title="Détails du formulaire de grossesse" content={hospitDetails} onClose={onClose} />
}

export default HospitFormDetails
