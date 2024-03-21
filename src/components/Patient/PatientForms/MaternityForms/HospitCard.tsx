import React from 'react'
import { getDataFromForm } from 'utils/formUtils'
import { CohortQuestionnaireResponse } from 'types'
import { hospitForm } from 'data/hospitData'
import moment from 'moment'
import FormCards from 'components/ui/FormCard'
import DomainAdd from '@mui/icons-material/DomainAdd'
interface HospitCardProps {
  form: CohortQuestionnaireResponse
}

const HospitCard: React.FC<HospitCardProps> = ({ form }) => {
  const hospitChipData = [
    form.item?.find((item) => item.linkId === hospitForm.birthDeliveryStartDate.id)
      ? `Accouchement le ${getDataFromForm(form, hospitForm.birthDeliveryStartDate)}`
      : `Date d'écriture : ${moment(form.authored).format('DD/MM/YYYY')}`,
    `Unité exécutrice : ${form.serviceProvider}`
  ]
  const hospitDetails = [
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
    {
      name: 'Âge gestationnel lors de la chirurgie ou du geste',
      value: getDataFromForm(form, hospitForm.ageDuringChirurgicalGesture)
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
      value: getDataFromForm(form, hospitForm.birthVitalStatus)
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

  return (
    <FormCards
      cardColor="#A8D178"
      title="Fiche d'hospitalisation"
      chipsInfo={hospitChipData}
      formDetails={hospitDetails}
      avatar={<DomainAdd htmlColor="#A8D178" />}
    />
  )
}

export default HospitCard
