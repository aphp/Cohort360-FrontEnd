import { ExportProjectDetails, ExportPurpose } from 'types/export'
import { isEndBeforeStart } from 'utils/dates'

export const PURPOSE_OPTIONS: { value: ExportPurpose; label: string; definition: string }[] = [
  {
    value: ExportPurpose.CARE_SUPPORT,
    label: 'Appui au soin',
    definition:
      "Export permettant directement la prise en charge de patients (suivi d'une file active, préparation de consultations, identification de patients à revoir pour leur soin)."
  },
  {
    value: ExportPurpose.ACTIVITY_MANAGEMENT,
    label: "Pilotage de l'activité",
    definition:
      "Export permettant d'organiser, évaluer ou piloter l'activité d'un service, d'un pôle ou d'un hôpital, sans visée de publication."
  },
  {
    value: ExportPurpose.INTERNAL_RESEARCH,
    label: 'Recherche interne',
    definition:
      "Projet de recherche porté par une équipe de l'AP-HP et mené sur les données de l'EDS sans autre centre partenaire, avec une visée de production de connaissance (publication, communication, thèse, mémoire)."
  },
  {
    value: ExportPurpose.MULTICENTER_RESEARCH,
    label: 'Recherche multicentrique',
    definition: 'Projet de recherche impliquant plusieurs centres ou partenaires extérieurs.'
  }
]

export const isKnownPurpose = (purpose: string): purpose is ExportPurpose =>
  PURPOSE_OPTIONS.some((option) => option.value === purpose)

export const EMPTY_PROJECT_DETAILS: ExportProjectDetails = {
  title: '',
  project_leader: '',
  start_date: null,
  end_date: null
}

export const isPurposeComplete = (
  purpose: ExportPurpose | null,
  projectDetails: ExportProjectDetails,
  hasIncompleteDate: boolean
) => {
  if (purpose === null) return false
  if (purpose !== ExportPurpose.INTERNAL_RESEARCH) return true
  return (
    projectDetails.title.trim() !== '' &&
    projectDetails.project_leader.trim() !== '' &&
    !hasIncompleteDate &&
    !isEndBeforeStart(projectDetails.start_date, projectDetails.end_date)
  )
}

export const toProjectDetailsPayload = (purpose: ExportPurpose, projectDetails: ExportProjectDetails) =>
  purpose === ExportPurpose.INTERNAL_RESEARCH
    ? {
        ...projectDetails,
        title: projectDetails.title.trim(),
        project_leader: projectDetails.project_leader.trim()
      }
    : null
