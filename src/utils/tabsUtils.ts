import { PmsiTab } from 'types'
import { PMSILabel } from 'types/patient'
import { MedicationLabel, ResourceType } from 'types/requestCriterias'
import { medicationTabs } from 'views/Dashboard'

const PMSITabs: PmsiTab[] = [
  { label: PMSILabel.DIAGNOSTIC, id: ResourceType.CONDITION },
  { label: PMSILabel.CCAM, id: ResourceType.PROCEDURE },
  { label: PMSILabel.GHM, id: ResourceType.CLAIM }
]

export const getPMSITab = (tabId?: string) => {
  return (
    PMSITabs.find((tab) => tab.id.toLocaleLowerCase() === tabId?.toLocaleLowerCase()) ?? {
      id: ResourceType.CONDITION,
      label: PMSILabel.DIAGNOSTIC
    }
  )
}

export const getMedicationTab = (tabId?: string) => {
  return (
    medicationTabs.find((tab) => tab.id.toLocaleLowerCase() === tabId?.toLocaleLowerCase()) ?? {
      id: ResourceType.MEDICATION_REQUEST,
      label: MedicationLabel.PRESCRIPTION
    }
  )
}
