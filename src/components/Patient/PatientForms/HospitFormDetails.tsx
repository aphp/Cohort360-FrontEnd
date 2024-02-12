import React from 'react'
import FormDetailsDialog from 'components/ui/FormDetailsDialog'
import { QuestionnaireResponse } from 'fhir/r4'

type HospitFormDetailsProps = {
  hospitFormData: QuestionnaireResponse
  onClose: () => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HospitFormDetails = ({ hospitFormData, onClose }: HospitFormDetailsProps) => {
  const hospitDetails = [
    {
      name: "Motif d'hospitalisation",
      value: ''
    },
    { name: 'Date geste ou chirurgie', value: '' },
    {
      name: 'Âge gestationnel lors de la chirurgie ou du geste',
      value: ''
    },
    { name: 'Type de geste ou chirurgie', value: '' },
    {
      name: 'Accouchement',
      value: ''
    },
    {
      name: "Lieu d'accouchement - domicile",
      value: ''
    },
    {
      name: 'Mode de mise en travail',
      value: ''
    },
    {
      name: 'Motif(s) de maturation cervicale initiale',
      value: ''
    },
    {
      name: 'Modalités de maturation cervicale initiale',
      value: ''
    },
    {
      name: "Voie d'accouchement",
      value: ''
    },
    {
      name: 'Identité - Sexe',
      value: ''
    },
    {
      name: 'Mensurations naissance - Poids (g)',
      value: ''
    },
    {
      name: 'Statut vital à la naissance',
      value: ''
    },
    {
      name: 'Périnée - État',
      value: ''
    },
    {
      name: 'Pertes sanguines estimées totales (mL)',
      value: ''
    },
    {
      name: 'Lieu de sortie - Type',
      value: ''
    },
    {
      name: "Type d'allaitement",
      value: ''
    }
  ]

  return <FormDetailsDialog title="Détails du formulaire de grossesse" content={hospitDetails} onClose={onClose} />
}

export default HospitFormDetails
