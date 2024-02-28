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
      value: getDataFromForm(hospitFormData, hospitForm.inUteroTransfer)
    },
    {
      name: 'Corticothérapie pour maturation foetale faite',
      value: getDataFromForm(hospitFormData, hospitForm.maturationCorticotherapie)
    },
    {
      name: 'Date geste ou chirurgie',
      value: getDataFromForm(hospitFormData, hospitForm.chirurgicalGestureDate)
    },
    {
      name: 'Âge gestationnel lors de la chirurgie ou du geste',
      value: getDataFromForm(hospitFormData, hospitForm.ageDuringChirurgicalGesture)
    },
    { name: 'Type de geste ou chirurgie', value: getDataFromForm(hospitFormData, hospitForm.chirurgicalGesture) },
    {
      name: 'Accouchement',
      value: getDataFromForm(hospitFormData, hospitForm.childbirth)
    },
    // {
    //   name: "Lieu d'accouchement - domicile",
    //   value: getDataFromForm(hospitFormData, hospitForm.childbirthPlace)
    // },
    {
      name: 'Mode de mise en travail',
      value: getDataFromForm(hospitFormData, hospitForm.childbirthMode)
    },
    {
      name: 'Motif de maturation / déclenchement',
      value: getDataFromForm(hospitFormData, hospitForm.maturationReason)
    },
    {
      name: 'Modalités de maturation cervicale initiale',
      value: getDataFromForm(hospitFormData, hospitForm.maturationModality)
    },
    {
      name: 'Présentation du foetus - liste',
      value: getDataFromForm(hospitFormData, hospitForm.foetusPresentation)
    },
    {
      name: "Présentation à l'entrée en travail ou en début de césarienne",
      value: getDataFromForm(hospitFormData, hospitForm.laborOrCesareanEntry)
    },
    {
      name: 'Analgésie / anesthésie - type',
      value: getDataFromForm(hospitFormData, hospitForm.analgesieType)
    },
    {
      name: 'Accouchement - Date/heure',
      value: getDataFromForm(hospitFormData, hospitForm.birthDeliveryStartDate)
    },
    {
      name: 'Accouchement - Terme - Semaines',
      value: getDataFromForm(hospitFormData, hospitForm.birthDeliveryWeeks)
    },
    {
      name: 'Accouchement - Terme - Jours',
      value: getDataFromForm(hospitFormData, hospitForm.birthDeliveryDays)
    },
    {
      name: "Voie d'accouchement",
      value: getDataFromForm(hospitFormData, hospitForm.birthDeliveryWay)
    },
    {
      name: 'Modalités de la césarienne',
      value: getDataFromForm(hospitFormData, hospitForm.cSectionModality)
    },
    {
      name: 'Identité - Sexe',
      value: getDataFromForm(hospitFormData, hospitForm.gender)
    },
    {
      name: 'Mensurations naissance - Poids (g)',
      value: getDataFromForm(hospitFormData, hospitForm.birthMensurationsGrams)
    },
    {
      name: 'Mensurations naissance - Poids percentile',
      value: getDataFromForm(hospitFormData, hospitForm.birthMensurationsPercentil)
    },
    {
      name: 'Statut vital à la naissance',
      value: getDataFromForm(hospitFormData, hospitForm.birthVitalStatus)
    },
    {
      name: 'Hémorragie du post-partum',
      value: getDataFromForm(hospitFormData, hospitForm.postpartumHemorrhage)
    },
    {
      name: 'Périnée - État',
      value: getDataFromForm(hospitFormData, hospitForm.conditionPerineum)
    },
    {
      name: 'Pertes sanguines estimées totales (mL)',
      value: getDataFromForm(hospitFormData, hospitForm.bloodLossEstimation)
    },
    {
      name: 'Lieu de sortie - Type',
      value: getDataFromForm(hospitFormData, hospitForm.exitPlaceType)
    },
    {
      name: "Type d'allaitement",
      value: getDataFromForm(hospitFormData, hospitForm.feedingType)
    }
  ]

  return <FormDetailsDialog title="Détails du formulaire de grossesse" content={hospitDetails} onClose={onClose} />
}

export default HospitFormDetails
